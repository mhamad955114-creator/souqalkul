
-- Fix 1: Create purchase_subscription RPC (atomic payment + subscription creation)
CREATE OR REPLACE FUNCTION public.purchase_subscription(
  _user_id UUID,
  _plan_type TEXT,
  _price NUMERIC,
  _duration_days INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance NUMERIC;
  _subscription_id UUID;
  _expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verify caller owns the account
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate plan type
  IF _plan_type NOT IN ('featured', 'professional') THEN
    RAISE EXCEPTION 'Invalid plan type';
  END IF;

  -- Validate price and duration
  IF _price <= 0 OR _duration_days <= 0 THEN
    RAISE EXCEPTION 'Invalid price or duration';
  END IF;

  -- Atomically process payment (this locks the wallet row and deducts)
  _new_balance := process_wallet_payment(
    _user_id,
    _price,
    'package',
    'شراء باقة ' || _plan_type
  );

  -- Calculate expiration
  _expires_at := now() + (_duration_days || ' days')::INTERVAL;

  -- Create subscription
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
$$;

-- Fix 2: Create admin_approve_topup RPC (atomic admin wallet approval)
CREATE OR REPLACE FUNCTION public.admin_approve_topup(
  _request_id UUID,
  _admin_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_id UUID;
  _request RECORD;
  _current_balance NUMERIC;
  _new_balance NUMERIC;
BEGIN
  _admin_id := auth.uid();

  -- Verify admin role
  IF NOT has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Get and validate request
  SELECT * INTO _request FROM top_up_requests WHERE id = _request_id;
  IF _request IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  IF _request.status != 'pending' THEN
    RAISE EXCEPTION 'Request already processed';
  END IF;

  -- Update request status
  UPDATE top_up_requests
  SET status = 'approved',
      admin_note = _admin_note,
      reviewed_by = _admin_id,
      reviewed_at = now()
  WHERE id = _request_id;

  -- Lock wallet and update balance atomically
  SELECT balance INTO _current_balance
  FROM wallets
  WHERE user_id = _request.user_id
  FOR UPDATE;

  IF _current_balance IS NULL THEN
    -- Create wallet if not exists
    INSERT INTO wallets (user_id, balance) VALUES (_request.user_id, _request.amount);
    _new_balance := _request.amount;
  ELSE
    _new_balance := _current_balance + _request.amount;
    UPDATE wallets SET balance = _new_balance, updated_at = now()
    WHERE user_id = _request.user_id;
  END IF;

  -- Record transaction
  INSERT INTO wallet_transactions (user_id, type, amount, balance_after, description)
  VALUES (
    _request.user_id,
    'top_up',
    _request.amount,
    _new_balance,
    'شحن رصيد عبر شام كاش - رقم العملية: ' || _request.transaction_number
  );

  -- Send notification
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    _request.user_id,
    'تم شحن محفظتك',
    'تم إضافة ' || _request.amount || ' إلى محفظتك بنجاح',
    'wallet'
  );
END;
$$;
