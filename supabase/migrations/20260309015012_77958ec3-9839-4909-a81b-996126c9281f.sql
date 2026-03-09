
-- Allow admins to upload and manage brand assets in the listings bucket
CREATE POLICY "Admins can manage brand assets"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = 'brand' AND
  public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = 'brand' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);
