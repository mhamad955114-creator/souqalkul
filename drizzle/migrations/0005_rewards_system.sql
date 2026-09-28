CREATE TABLE public.reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL,
  reason text NOT NULL,
  ref_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reason, ref_key)
);
CREATE INDEX idx_reward_tx_user ON public.reward_transactions(user_id, created_at DESC);
GRANT SELECT ON public.reward_transactions TO authenticated;
GRANT ALL ON public.reward_transactions TO service_role;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own rewards" ON public.reward_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all rewards" ON public.reward_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE OR REPLACE FUNCTION public.award_points(_user_id uuid, _points integer, _reason text, _ref text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n integer;
BEGIN
  INSERT INTO public.reward_transactions (user_id, points, reason, ref_key)
  VALUES (_user_id, _points, _reason, _ref) ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n > 0;
END $$;
REVOKE EXECUTE ON FUNCTION public.award_points(uuid, integer, text, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_reward_balance(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(points), 0)::integer FROM public.reward_transactions
  WHERE user_id = _user_id AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
$$;

CREATE OR REPLACE FUNCTION public.reward_on_listing()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _today integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT count(*) INTO _today FROM public.reward_transactions
    WHERE user_id = NEW.user_id AND reason = 'listing' AND created_at > now() - interval '1 day';
    IF _today < 5 THEN
      PERFORM public.award_points(NEW.user_id, 5, 'listing', NEW.id::text);
    END IF;
  ELSIF NEW.status = 'sold' AND OLD.status IS DISTINCT FROM 'sold' THEN
    PERFORM public.award_points(NEW.user_id, 10, 'sold', NEW.id::text);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;
CREATE TRIGGER reward_on_listing_trigger AFTER INSERT OR UPDATE OF status ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.reward_on_listing();

CREATE OR REPLACE FUNCTION public.reward_on_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_points(NEW.reviewer_id, 2, 'rating_given', NEW.id::text);
  IF NEW.rating >= 4 THEN
    PERFORM public.award_points(NEW.seller_id, 5, 'rating_received', NEW.id::text);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;
CREATE TRIGGER reward_on_rating_trigger AFTER INSERT ON public.ratings
FOR EACH ROW EXECUTE FUNCTION public.reward_on_rating();

CREATE OR REPLACE FUNCTION public.claim_daily_reward()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN public.award_points(auth.uid(), 2, 'daily', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD'));
END $$;

CREATE OR REPLACE FUNCTION public.apply_referral(_code text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _me uuid := auth.uid(); _referrer uuid; _created timestamptz;
BEGIN
  IF _me IS NULL THEN RETURN 'unauthorized'; END IF;
  IF _code IS NULL OR length(_code) <> 8 OR _code !~ '^[0-9a-fA-F]{8}$' THEN RETURN 'invalid'; END IF;
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = _me) THEN RETURN 'already'; END IF;
  SELECT created_at INTO _created FROM auth.users WHERE id = _me;
  IF _created < now() - interval '7 days' THEN RETURN 'too_late'; END IF;
  SELECT user_id INTO _referrer FROM public.profiles WHERE user_id::text LIKE lower(_code) || '%' LIMIT 1;
  IF _referrer IS NULL THEN RETURN 'invalid'; END IF;
  IF _referrer = _me THEN RETURN 'self'; END IF;
  INSERT INTO public.referrals (referrer_id, referred_id) VALUES (_referrer, _me);
  PERFORM public.award_points(_referrer, 20, 'referral', _me::text);
  PERFORM public.award_points(_me, 10, 'referred', _referrer::text);
  RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION public.redeem_reward(_plan_type text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _me uuid := auth.uid(); _cost integer; _balance integer;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  _cost := CASE _plan_type WHEN 'featured' THEN 100 WHEN 'professional' THEN 250 WHEN 'business' THEN 500 ELSE NULL END;
  IF _cost IS NULL THEN RETURN 'invalid'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('reward:' || _me::text));
  SELECT COALESCE(SUM(points),0) INTO _balance FROM public.reward_transactions WHERE user_id = _me;
  IF _balance < _cost THEN RETURN 'insufficient'; END IF;
  INSERT INTO public.reward_transactions (user_id, points, reason, ref_key)
  VALUES (_me, -_cost, 'redeem_' || _plan_type, gen_random_uuid()::text);
  INSERT INTO public.user_subscriptions (user_id, plan_type, expires_at, status)
  VALUES (_me, _plan_type, now() + interval '7 days', 'active');
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (_me, 'تم استبدال نقاطك', 'تم تفعيل باقة ' || _plan_type || ' لمدة 7 أيام', 'subscription');
  RETURN 'ok';
END $$;