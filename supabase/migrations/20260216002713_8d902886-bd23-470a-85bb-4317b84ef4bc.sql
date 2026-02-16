
-- Create secure function to get phone only for authenticated users
CREATE OR REPLACE FUNCTION public.get_user_phone(_target_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NOT NULL THEN phone
    ELSE NULL
  END
  FROM public.profiles
  WHERE user_id = _target_user_id
$$;

-- Create secure function to get listing phone only for authenticated users
CREATE OR REPLACE FUNCTION public.get_listing_phone(_listing_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NOT NULL THEN phone
    ELSE NULL
  END
  FROM public.listings
  WHERE id = _listing_id
$$;

-- Add constraints to contact_messages to prevent abuse
ALTER TABLE public.contact_messages 
  ADD CONSTRAINT contact_messages_name_length CHECK (char_length(name) <= 100),
  ADD CONSTRAINT contact_messages_email_length CHECK (char_length(email) <= 255),
  ADD CONSTRAINT contact_messages_subject_length CHECK (char_length(subject) <= 200),
  ADD CONSTRAINT contact_messages_message_length CHECK (char_length(message) <= 2000);
