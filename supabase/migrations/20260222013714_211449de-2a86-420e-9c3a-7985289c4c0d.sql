
CREATE OR REPLACE FUNCTION public.admin_approve_topup(_request_id uuid, _admin_note text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _admin_id UUID;
  _request RECORD;
  _current_balance NUMERIC;
  _new_balance NUMERIC;
BEGIN
  _admin_id := auth.uid();

  IF NOT has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  SELECT * INTO _request FROM top_up_requests WHERE id = _request_id;
  IF _request IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  IF _request.status != 'pending' THEN
    RAISE EXCEPTION 'Request already processed';
  END IF;

  UPDATE top_up_requests
  SET status = 'approved',
      admin_note = _admin_note,
      reviewed_by = _admin_id,
      reviewed_at = now()
  WHERE id = _request_id;

  SELECT balance INTO _current_balance
  FROM wallets
  WHERE user_id = _request.user_id
  FOR UPDATE;

  IF _current_balance IS NULL THEN
    INSERT INTO wallets (user_id, balance) VALUES (_request.user_id, _request.amount);
    _new_balance := _request.amount;
  ELSE
    _new_balance := _current_balance + _request.amount;
    UPDATE wallets SET balance = _new_balance, updated_at = now()
    WHERE user_id = _request.user_id;
  END IF;

  INSERT INTO wallet_transactions (user_id, type, amount, balance_after, description)
  VALUES (
    _request.user_id,
    'top_up',
    _request.amount,
    _new_balance,
    'شحن رصيد عبر شام كاش - رقم العملية: ' || _request.transaction_number
  );

  -- Notification 1: wallet topped up
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    _request.user_id,
    'تم شحن محفظتك',
    'تم إضافة ' || _request.amount || ' إلى محفظتك بنجاح',
    'wallet'
  );

  -- Notification 2: hint about dating subscription
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    _request.user_id,
    '🎉 يمكنك الآن شراء باقة التعارف',
    'رصيدك الحالي ' || _new_balance || ' - يمكنك شراء باقة التعارف لفتح الدردشة من صفحة المحفظة',
    'subscription_hint'
  );
END;
$function$;
