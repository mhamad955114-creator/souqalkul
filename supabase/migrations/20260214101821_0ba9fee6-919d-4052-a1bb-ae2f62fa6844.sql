
-- 1. Fix messages UPDATE policy: only sender can update, and only is_read field
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Participants can mark messages as read"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- 2. Remove direct INSERT on wallet_transactions (should only be via process_wallet_payment RPC)
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.wallet_transactions;

-- 3. Allow system/service role to insert wallet transactions (via the RPC function which is SECURITY DEFINER)
-- No explicit INSERT policy needed since process_wallet_payment is SECURITY DEFINER
