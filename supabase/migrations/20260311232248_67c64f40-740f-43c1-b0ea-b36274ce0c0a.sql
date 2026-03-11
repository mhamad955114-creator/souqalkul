-- Fix 1: Remove wallet UPDATE policy that allows users to freely modify balance
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;

-- Fix 2: Remove public SELECT policy on push_subscriptions that exposes credentials to anonymous users
DROP POLICY IF EXISTS "Service role can view all push subscriptions" ON public.push_subscriptions;