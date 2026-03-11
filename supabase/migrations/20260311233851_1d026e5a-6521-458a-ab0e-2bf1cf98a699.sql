-- Fix the security definer view by making it use invoker security instead
ALTER VIEW public.public_profiles SET (security_invoker = on);