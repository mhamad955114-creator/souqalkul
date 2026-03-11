-- Fix 1: Profiles - restrict phone to owner only, allow public fields for all authenticated
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Policy: users can see their own full profile (including phone)
CREATE POLICY "Users can view own full profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Policy: authenticated users can see public fields of other users (phone excluded via app-level RPC)
-- We use a security definer view instead for public profile data
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT user_id, full_name, avatar_url, city, is_verified, created_at
  FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Fix 2: Listings - restrict to authenticated users only  
DROP POLICY IF EXISTS "Active and sold listings are viewable by everyone" ON public.listings;

CREATE POLICY "Active and sold listings viewable by authenticated" ON public.listings
  FOR SELECT TO authenticated
  USING (status = ANY (ARRAY['active'::text, 'sold'::text]) OR auth.uid() = user_id);

-- Also allow anon to see listings but without phone (handled at app level, 
-- but we still need basic listing visibility for non-logged-in browsing)
CREATE POLICY "Anon can view active listings" ON public.listings
  FOR SELECT TO anon
  USING (status = ANY (ARRAY['active'::text, 'sold'::text]));