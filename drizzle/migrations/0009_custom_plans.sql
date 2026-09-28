CREATE TABLE public.custom_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL UNIQUE DEFAULT ('c_' || substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  base_tier text NOT NULL DEFAULT 'featured',
  name_ar text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  name_tr text NOT NULL DEFAULT '',
  features_ar text NOT NULL DEFAULT '',
  features_en text NOT NULL DEFAULT '',
  features_tr text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  max_active_listings integer NOT NULL DEFAULT 10,
  max_images integer NOT NULL DEFAULT 10,
  reward_cost integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#f97316',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT custom_plans_base_tier_chk CHECK (base_tier IN ('featured','professional','business')),
  CONSTRAINT custom_plans_values_chk CHECK (price >= 0 AND duration_days > 0 AND reward_cost >= 0)
);
GRANT SELECT ON public.custom_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_plans TO authenticated;
GRANT ALL ON public.custom_plans TO service_role;
ALTER TABLE public.custom_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view plans" ON public.custom_plans FOR SELECT USING (true);
CREATE POLICY "Admins insert plans" ON public.custom_plans FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update plans" ON public.custom_plans FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete plans" ON public.custom_plans FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER custom_plans_updated_at BEFORE UPDATE ON public.custom_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.plan_base_tier(_plan text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT CASE WHEN _plan IN ('featured','professional','business') THEN _plan
    ELSE (SELECT base_tier FROM public.custom_plans WHERE plan_key = _plan) END
$$;

CREATE OR REPLACE FUNCTION public.get_plan_config(_plan_type text)
RETURNS TABLE(price numeric, duration_days integer) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (setting_value ->> 'price')::numeric, (setting_value ->> 'duration_days')::integer
  FROM public.listing_settings
  WHERE _plan_type IN ('featured','professional','business') AND setting_key = _plan_type || '_listing'
  UNION ALL
  SELECT cp.price, cp.duration_days FROM public.custom_plans cp
  WHERE cp.plan_key = _plan_type AND cp.is_active
$$;

CREATE OR REPLACE FUNCTION public.admin_approve_subscription_request(_request_id uuid, _admin_note text DEFAULT NULL::text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _admin_id UUID; _request RECORD; _subscription_id UUID; _expires_at timestamptz; _price NUMERIC; _duration INTEGER; _name text;
BEGIN
  _admin_id := auth.uid();
  IF NOT has_role(_admin_id, 'admin') THEN RAISE EXCEPTION 'Unauthorized: Admin role required'; END IF;
  SELECT * INTO _request FROM top_up_requests WHERE id = _request_id;
  IF _request IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF _request.status != 'pending' THEN RAISE EXCEPTION 'Request already processed'; END IF;
  UPDATE top_up_requests SET status='approved', admin_note=_admin_note, reviewed_by=_admin_id, reviewed_at=now() WHERE id=_request_id;
  IF _request.plan_type IS NOT NULL THEN
    IF public.plan_base_tier(_request.plan_type) IS NULL THEN RAISE EXCEPTION 'Invalid plan type'; END IF;
    SELECT price, duration_days INTO _price, _duration FROM public.get_plan_config(_request.plan_type);
    IF _price IS NULL OR _duration IS NULL THEN RAISE EXCEPTION 'Plan is not available'; END IF;
    IF _request.amount <> _price THEN RAISE EXCEPTION 'Request amount does not match the official plan price'; END IF;
    UPDATE public.user_subscriptions SET status='inactive' WHERE user_id=_request.user_id AND status='active' AND expires_at > now();
    _expires_at := now() + (_duration || ' days')::INTERVAL;
    INSERT INTO public.user_subscriptions (user_id, plan_type, expires_at, status)
    VALUES (_request.user_id, _request.plan_type, _expires_at, 'active') RETURNING id INTO _subscription_id;
    SELECT name_ar INTO _name FROM public.custom_plans WHERE plan_key = _request.plan_type;
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (_request.user_id, 'تم تفعيل اشتراكك', 'تم تفعيل باقة ' || COALESCE(_name, _request.plan_type) || ' بنجاح! صالحة لمدة ' || _duration || ' يوم', 'subscription');
  END IF;
END; $function$;

CREATE OR REPLACE FUNCTION public.enforce_listing_badge()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _plan TEXT; _badge TEXT; _featured BOOLEAN;
BEGIN
  IF has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  SELECT plan_type INTO _plan FROM public.user_subscriptions
  WHERE user_id = NEW.user_id AND status = 'active' AND expires_at > now()
  ORDER BY expires_at DESC LIMIT 1;
  _badge := public.plan_base_tier(_plan);
  _featured := _badge IS NOT NULL;
  IF TG_OP = 'UPDATE' AND auth.uid() IS NULL THEN RETURN NEW; END IF;
  NEW.badge_type := _badge;
  NEW.is_featured := _featured;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.sync_listings_badge_on_subscription_change()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _badge text; _featured boolean; _listing RECORD;
BEGIN
  IF NEW.status = 'active' AND NEW.expires_at > now() THEN
    _badge := public.plan_base_tier(NEW.plan_type);
  ELSE _badge := NULL; END IF;
  _featured := _badge IS NOT NULL;
  FOR _listing IN SELECT id, badge_type, is_featured FROM public.listings
    WHERE user_id = NEW.user_id AND status = 'active'
      AND (badge_type IS DISTINCT FROM _badge OR is_featured IS DISTINCT FROM _featured)
  LOOP
    INSERT INTO public.badge_audit_log (listing_id, user_id, old_badge_type, new_badge_type, old_is_featured, new_is_featured, subscription_id)
    VALUES (_listing.id, NEW.user_id, _listing.badge_type, _badge, _listing.is_featured, _featured, NEW.id);
  END LOOP;
  UPDATE public.listings SET badge_type = _badge, is_featured = _featured WHERE user_id = NEW.user_id AND status = 'active';
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.validate_top_up_request()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _price NUMERIC; _duration INTEGER; _receipt_exists BOOLEAN;
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;
  IF NEW.plan_type IS NOT NULL THEN
    IF public.plan_base_tier(NEW.plan_type) IS NULL THEN RAISE EXCEPTION 'Invalid plan type'; END IF;
    SELECT price, duration_days INTO _price, _duration FROM public.get_plan_config(NEW.plan_type);
    IF _price IS NULL OR _duration IS NULL THEN RAISE EXCEPTION 'Plan is not available'; END IF;
    IF NEW.amount <> _price THEN RAISE EXCEPTION 'Plan amount does not match the official price'; END IF;
    NEW.duration_days := _duration;
  ELSIF NEW.duration_days IS NOT NULL THEN
    RAISE EXCEPTION 'Duration is only allowed for plan requests';
  END IF;
  IF NEW.receipt_url IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'receipts'
      AND split_part(o.name, '/', 1) = NEW.user_id::text AND NEW.receipt_url LIKE '%' || o.name) INTO _receipt_exists;
    IF NOT _receipt_exists THEN RAISE EXCEPTION 'Receipt file not found for this user'; END IF;
  END IF;
  NEW.status := 'pending'; NEW.reviewed_by := NULL; NEW.reviewed_at := NULL; NEW.admin_note := NULL;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.redeem_reward(_plan_type text)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _me uuid := auth.uid(); _cost integer; _balance integer; _days integer; _name text;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF NOT public.rewards_enabled() THEN RETURN 'disabled'; END IF;
  IF _plan_type IN ('featured','professional','business') THEN
    _cost := public.rcfg_int('cost_' || _plan_type);
    _days := public.rcfg_int('redeem_days');
  ELSE
    SELECT reward_cost, duration_days, name_ar INTO _cost, _days, _name
    FROM public.custom_plans WHERE plan_key = _plan_type AND is_active;
    IF _cost IS NULL THEN RETURN 'invalid'; END IF;
  END IF;
  IF _cost <= 0 OR _days <= 0 THEN RETURN 'invalid'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('reward:' || _me::text));
  SELECT COALESCE(SUM(points),0) INTO _balance FROM public.reward_transactions WHERE user_id = _me;
  IF _balance < _cost THEN RETURN 'insufficient'; END IF;
  INSERT INTO public.reward_transactions (user_id, points, reason, ref_key)
  VALUES (_me, -_cost, 'redeem_' || _plan_type, gen_random_uuid()::text);
  INSERT INTO public.user_subscriptions (user_id, plan_type, expires_at, status)
  VALUES (_me, _plan_type, now() + (_days || ' days')::interval, 'active');
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (_me, 'تم استبدال نقاطك', 'تم تفعيل باقة ' || COALESCE(_name,_plan_type) || ' لمدة ' || _days || ' أيام', 'subscription');
  RETURN 'ok';
END $function$;