-- Make receipts bucket private
UPDATE storage.buckets SET public = false WHERE id = 'receipts';

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;