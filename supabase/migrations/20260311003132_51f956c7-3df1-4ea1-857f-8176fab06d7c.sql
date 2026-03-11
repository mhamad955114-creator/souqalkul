CREATE POLICY "Anyone can view active subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (status = 'active' AND expires_at > now());