-- Fix 1: Storage policies - scope to file owner
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;

CREATE POLICY "Users can update their own listing images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'listings' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own listing images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'listings' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix 2: Wallet RPC - add caller authorization
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
  -- CRITICAL: Verify caller owns the wallet
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot process payment for another user';
  END IF;

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