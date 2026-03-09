-- Fix 1: contact_messages INSERT policy - replace WITH CHECK (true) with proper validation
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
  FOR INSERT TO public
  WITH CHECK (
    length(trim(name))    >= 2  AND length(name)    <= 100  AND
    length(trim(email))   >= 5  AND length(email)   <= 255  AND
    position('@' IN email) > 1                              AND
    length(trim(subject)) >= 2  AND length(subject) <= 200  AND
    length(trim(message)) >= 10 AND length(message) <= 2000
  );

-- Fix 2: profiles phone exposure - remove anonymous read access
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);