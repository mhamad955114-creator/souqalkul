ALTER TABLE public.listings
ADD COLUMN custom_plan_key text NULL REFERENCES public.custom_plans(plan_key) ON DELETE SET NULL;

CREATE INDEX listings_custom_plan_key_idx ON public.listings(custom_plan_key) WHERE custom_plan_key IS NOT NULL;

COMMENT ON COLUMN public.listings.custom_plan_key IS 'Custom package key used to render that package own color and glow; NULL for built-in packages.';

CREATE OR REPLACE FUNCTION public.sync_listings_badge_on_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _badge text; _featured boolean; _custom_plan_key text; _listing RECORD;
BEGIN
  IF NEW.status = 'active' AND NEW.expires_at > now() THEN
    _badge := public.plan_base_tier(NEW.plan_type);
    SELECT plan_key INTO _custom_plan_key FROM public.custom_plans WHERE plan_key = NEW.plan_type;
  ELSE
    _badge := NULL;
    _custom_plan_key := NULL;
  END IF;
  _featured := _badge IS NOT NULL;
  FOR _listing IN SELECT id, badge_type, is_featured FROM public.listings
    WHERE user_id = NEW.user_id AND status = 'active'
      AND (badge_type IS DISTINCT FROM _badge OR is_featured IS DISTINCT FROM _featured OR custom_plan_key IS DISTINCT FROM _custom_plan_key)
  LOOP
    INSERT INTO public.badge_audit_log (listing_id, user_id, old_badge_type, new_badge_type, old_is_featured, new_is_featured, subscription_id)
    VALUES (_listing.id, NEW.user_id, _listing.badge_type, _badge, _listing.is_featured, _featured, NEW.id);
  END LOOP;
  UPDATE public.listings
  SET badge_type = _badge, is_featured = _featured, custom_plan_key = _custom_plan_key
  WHERE user_id = NEW.user_id AND status = 'active';
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.enforce_listing_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _plan TEXT; _badge TEXT; _featured BOOLEAN; _custom_plan_key TEXT;
BEGIN
  IF has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  SELECT plan_type INTO _plan FROM public.user_subscriptions
  WHERE user_id = NEW.user_id AND status = 'active' AND expires_at > now()
  ORDER BY expires_at DESC LIMIT 1;
  _badge := public.plan_base_tier(_plan);
  SELECT plan_key INTO _custom_plan_key FROM public.custom_plans WHERE plan_key = _plan;
  _featured := _badge IS NOT NULL;
  IF TG_OP = 'UPDATE' AND auth.uid() IS NULL THEN RETURN NEW; END IF;
  NEW.badge_type := _badge;
  NEW.is_featured := _featured;
  NEW.custom_plan_key := _custom_plan_key;
  RETURN NEW;
END; $function$;

UPDATE public.listings AS l
SET custom_plan_key = (
  SELECT us.plan_type
  FROM public.user_subscriptions us
  JOIN public.custom_plans cp ON cp.plan_key = us.plan_type
  WHERE us.user_id = l.user_id
    AND us.status = 'active'
    AND us.expires_at > now()
  ORDER BY us.expires_at DESC
  LIMIT 1
)
WHERE l.status = 'active'
  AND EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    JOIN public.custom_plans cp ON cp.plan_key = us.plan_type
    WHERE us.user_id = l.user_id AND us.status = 'active' AND us.expires_at > now()
  );