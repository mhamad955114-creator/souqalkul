CREATE OR REPLACE FUNCTION public.get_active_subscription_types(_user_ids uuid[])
RETURNS TABLE(user_id uuid, plan_type text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT us.user_id, us.plan_type
  FROM public.user_subscriptions us
  WHERE us.user_id = ANY(_user_ids)
    AND us.status = 'active'
    AND us.expires_at > now()
$$;