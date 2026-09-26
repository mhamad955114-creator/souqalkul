REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, user_id, full_name, city, avatar_url, created_at, updated_at, is_verified, country) ON public.profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_profile_phones(_user_ids uuid[])
RETURNS TABLE(user_id uuid, phone text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.user_id, p.phone FROM public.profiles p
  WHERE p.user_id = ANY(_user_ids)
    AND (p.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
$$;
REVOKE EXECUTE ON FUNCTION public.get_profile_phones(uuid[]) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_profile_phones(uuid[]) TO authenticated;

DROP POLICY IF EXISTS "Listing images are publicly accessible" ON storage.objects;