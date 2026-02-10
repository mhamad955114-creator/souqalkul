
-- Allow admins to delete any listing
CREATE POLICY "Admins can delete any listing"
ON public.listings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
