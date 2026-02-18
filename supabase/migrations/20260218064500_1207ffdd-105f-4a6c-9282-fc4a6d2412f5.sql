
-- Revoke SELECT on phone column from anon and authenticated roles
-- Users must use the secure get_user_phone() RPC function instead
REVOKE SELECT (phone) ON public.profiles FROM anon, authenticated;

-- Grant phone SELECT only to the owner and admins via a security definer function
-- The existing get_user_phone() RPC already handles this securely
