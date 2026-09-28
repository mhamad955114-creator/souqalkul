CREATE OR REPLACE FUNCTION public.get_badge_glow_config()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT setting_value FROM public.admin_settings WHERE setting_key = 'badge_glow'), '{}'::jsonb)
$$;
GRANT EXECUTE ON FUNCTION public.get_badge_glow_config() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_badge_glow_config(_config jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  INSERT INTO public.admin_settings (setting_key, setting_value, updated_by, updated_at)
  VALUES ('badge_glow', _config, auth.uid(), now())
  ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_by = auth.uid(), updated_at = now();
END $$;