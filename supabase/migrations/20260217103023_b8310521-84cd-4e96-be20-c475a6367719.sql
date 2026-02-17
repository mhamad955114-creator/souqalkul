
-- Fix storage policies: restrict to authenticated and remove old anon policies
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Listing images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;

-- Listings bucket: public read is needed for displaying images, keep it
CREATE POLICY "Listing images are publicly accessible"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'listings');

-- Listing upload/update/delete restricted to authenticated
CREATE POLICY "Users can upload listing images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own listing images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
