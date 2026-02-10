
-- Create listing_settings table for admin-configurable pricing and duration
CREATE TABLE public.listing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Enable RLS
ALTER TABLE public.listing_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can view listing settings"
ON public.listing_settings
FOR SELECT
USING (true);

-- Only admins can update
CREATE POLICY "Admins can update listing settings"
ON public.listing_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert
CREATE POLICY "Admins can insert listing settings"
ON public.listing_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete listing settings"
ON public.listing_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.listing_settings (setting_key, setting_value) VALUES
('free_listing', '{"duration_days": 30, "max_images": 5, "max_active_listings": 3}'::jsonb),
('featured_listing', '{"price": 50000, "duration_days": 30, "max_images": 10, "max_active_listings": 10}'::jsonb),
('professional_listing', '{"price": 100000, "duration_days": 30, "max_images": 20, "max_active_listings": -1}'::jsonb);
