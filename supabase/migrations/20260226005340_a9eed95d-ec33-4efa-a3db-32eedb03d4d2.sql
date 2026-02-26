
CREATE OR REPLACE FUNCTION public.transfer_wallet_balance(
  _sender_id uuid,
  _receiver_id uuid,
  _amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _sender_balance NUMERIC;
  _sender_new_balance NUMERIC;
  _receiver_balance NUMERIC;
  _receiver_new_balance NUMERIC;
  _sender_name TEXT;
  _receiver_name TEXT;
BEGIN
  IF auth.uid() != _sender_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF _sender_id = _receiver_id THEN
    RAISE EXCEPTION 'Cannot transfer to yourself';
  END IF;

  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  -- Lock sender wallet
  SELECT balance INTO _sender_balance
  FROM wallets WHERE user_id = _sender_id FOR UPDATE;

  IF _sender_balance IS NULL THEN
    RAISE EXCEPTION 'Sender wallet not found';
  END IF;

  IF _sender_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Lock receiver wallet
  SELECT balance INTO _receiver_balance
  FROM wallets WHERE user_id = _receiver_id FOR UPDATE;

  IF _receiver_balance IS NULL THEN
    RAISE EXCEPTION 'Receiver wallet not found';
  END IF;

  -- Get names
  SELECT COALESCE(full_name, 'مستخدم') INTO _sender_name FROM profiles WHERE user_id = _sender_id;
  SELECT COALESCE(full_name, 'مستخدم') INTO _receiver_name FROM profiles WHERE user_id = _receiver_id;

  _sender_new_balance := _sender_balance - _amount;
  _receiver_new_balance := _receiver_balance + _amount;

  -- Update balances
  UPDATE wallets SET balance = _sender_new_balance, updated_at = now() WHERE user_id = _sender_id;
  UPDATE wallets SET balance = _receiver_new_balance, updated_at = now() WHERE user_id = _receiver_id;

  -- Record transactions
  INSERT INTO wallet_transactions (user_id, type, amount, balance_after, description, related_user_id)
  VALUES (_sender_id, 'transfer_out', -_amount, _sender_new_balance, 'تحويل إلى ' || _receiver_name, _receiver_id);

  INSERT INTO wallet_transactions (user_id, type, amount, balance_after, description, related_user_id)
  VALUES (_receiver_id, 'transfer_in', _amount, _receiver_new_balance, 'تحويل من ' || _sender_name, _sender_id);

  -- Record transfer
  INSERT INTO wallet_transfers (sender_id, receiver_id, amount) VALUES (_sender_id, _receiver_id, _amount);

  -- Notifications
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (_receiver_id, 'تحويل وارد', 'استلمت تحويل بقيمة ' || _amount || ' من ' || _sender_name, 'wallet');
END;
$function$;
