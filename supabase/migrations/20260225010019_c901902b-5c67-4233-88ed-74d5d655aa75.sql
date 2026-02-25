
-- Insert default business_listing setting
INSERT INTO public.listing_settings (setting_key, setting_value)
VALUES ('business_listing', '{"price": 200000, "duration_days": 60, "max_images": 30, "max_active_listings": -1}'::jsonb)
ON CONFLICT DO NOTHING;

-- Update purchase_subscription to accept 'business' plan type
CREATE OR REPLACE FUNCTION public.purchase_subscription(_user_id uuid, _plan_type text, _price numeric, _duration_days integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _new_balance NUMERIC;
  _subscription_id UUID;
  _expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF _plan_type NOT IN ('featured', 'professional', 'business') THEN
    RAISE EXCEPTION 'Invalid plan type';
  END IF;

  IF _price <= 0 OR _duration_days <= 0 THEN
    RAISE EXCEPTION 'Invalid price or duration';
  END IF;

  _new_balance := process_wallet_payment(
    _user_id,
    _price,
    'package',
    'شراء باقة ' || _plan_type
  );

  _expires_at := now() + (_duration_days || ' days')::INTERVAL;

  INSERT INTO user_subscriptions (
    user_id,
    plan_type,
    expires_at,
    status
  ) VALUES (
    _user_id,
    _plan_type,
    _expires_at,
    'active'
  ) RETURNING id INTO _subscription_id;

  RETURN _subscription_id;
END;
$function$;
