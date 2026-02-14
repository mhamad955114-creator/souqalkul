
-- 1. Listings table constraints (price >= 0 to allow dating listings)
ALTER TABLE public.listings
  ADD CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  ADD CONSTRAINT description_length CHECK (description IS NULL OR char_length(description) <= 5000),
  ADD CONSTRAINT price_non_negative CHECK (price >= 0 AND price < 1000000000),
  ADD CONSTRAINT images_limit CHECK (array_length(images, 1) IS NULL OR array_length(images, 1) <= 20),
  ADD CONSTRAINT phone_format CHECK (phone IS NULL OR phone ~ '^09\d{8}$');

-- 2. Contact messages constraints
ALTER TABLE public.contact_messages
  ADD CONSTRAINT name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  ADD CONSTRAINT email_length CHECK (char_length(email) >= 5 AND char_length(email) <= 255),
  ADD CONSTRAINT subject_length CHECK (char_length(subject) >= 3 AND char_length(subject) <= 200),
  ADD CONSTRAINT message_length CHECK (char_length(message) >= 10 AND char_length(message) <= 2000);

-- 3. Reports table constraints
ALTER TABLE public.reports
  ADD CONSTRAINT details_length CHECK (details IS NULL OR char_length(details) <= 500),
  ADD CONSTRAINT reason_length CHECK (char_length(reason) >= 3 AND char_length(reason) <= 200);

-- 4. Profiles table constraints
ALTER TABLE public.profiles
  ADD CONSTRAINT full_name_length CHECK (full_name IS NULL OR (char_length(full_name) >= 2 AND char_length(full_name) <= 100)),
  ADD CONSTRAINT phone_format_profile CHECK (phone IS NULL OR phone ~ '^09\d{8}$');

-- 5. Ratings table constraints
ALTER TABLE public.ratings
  ADD CONSTRAINT comment_length CHECK (comment IS NULL OR char_length(comment) <= 500);

-- 6. Messages table constraint
ALTER TABLE public.messages
  ADD CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000);

-- 7. Admin role management policies
CREATE POLICY "Admins can assign roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can revoke roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. Fix notify_buyers_on_sold - keep SECURITY DEFINER but function is well-scoped
CREATE OR REPLACE FUNCTION public.notify_buyers_on_sold()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'sold' AND (OLD.status IS DISTINCT FROM 'sold') THEN
    NEW.sold_at = now();
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    SELECT DISTINCT
      c.buyer_id,
      NEW.title,
      'تم بيع الإعلان: ' || NEW.title,
      'listing_sold',
      NEW.id
    FROM public.conversations c
    WHERE c.listing_id = NEW.id
      AND c.buyer_id != NEW.user_id;
  END IF;

  IF NEW.status = 'active' AND OLD.status = 'sold' THEN
    NEW.sold_at = NULL;
  END IF;

  RETURN NEW;
END;
$$;
