
-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL, -- 'featured' or 'professional'
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update subscriptions"
ON public.user_subscriptions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create atomic wallet payment function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.process_wallet_payment(
  _user_id UUID,
  _amount NUMERIC,
  _type TEXT,
  _description TEXT,
  _related_listing_id UUID DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_balance NUMERIC;
  _new_balance NUMERIC;
BEGIN
  -- Lock wallet row
  SELECT balance INTO _current_balance
  FROM public.wallets
  WHERE user_id = _user_id
  FOR UPDATE;

  IF _current_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  IF _current_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  _new_balance := _current_balance - _amount;

  -- Deduct balance
  UPDATE public.wallets
  SET balance = _new_balance, updated_at = now()
  WHERE user_id = _user_id;

  -- Record transaction
  INSERT INTO public.wallet_transactions (user_id, type, amount, balance_after, description, related_listing_id)
  VALUES (_user_id, _type, -_amount, _new_balance, _description, _related_listing_id);

  RETURN _new_balance;
END;
$$;
