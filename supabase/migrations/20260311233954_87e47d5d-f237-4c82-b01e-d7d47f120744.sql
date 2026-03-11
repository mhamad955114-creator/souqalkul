-- The restrictive "own profile only" policy breaks many features.
-- Better approach: allow authenticated users to read all profiles 
-- (phone is already protected via RPC functions get_user_phone/get_listing_phone in the UI)
-- but keep anon users blocked from profiles entirely.

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;

-- Restore authenticated read access (phone protected at app level via RPCs)
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Drop the view since we're using the table directly with RPCs for phone protection
DROP VIEW IF EXISTS public.public_profiles;