
-- Add maintenance_mode setting to listing_settings table
INSERT INTO public.listing_settings (setting_key, setting_value)
VALUES ('maintenance_mode', '{"enabled": false, "message": "الموقع تحت الصيانة حالياً، سنعود قريباً!"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;
