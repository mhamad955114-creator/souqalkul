-- Add receipt_url column to top_up_requests
ALTER TABLE public.top_up_requests ADD COLUMN receipt_url text;

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- Storage policies for receipts bucket
CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);