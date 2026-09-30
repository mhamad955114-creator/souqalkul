CREATE OR REPLACE FUNCTION public.get_grid_layout_config() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE((SELECT setting_value FROM admin_settings WHERE setting_key='grid_layout'), '{"mobile":2,"desktop":4}'::jsonb)
$$;
CREATE OR REPLACE FUNCTION public.admin_set_grid_layout_config(_config jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO admin_settings(setting_key, setting_value, updated_by) VALUES ('grid_layout', _config, auth.uid())
  ON CONFLICT (setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value, updated_by=auth.uid(), updated_at=now();
END $$;
GRANT EXECUTE ON FUNCTION public.get_grid_layout_config() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_grid_layout_config(jsonb) TO authenticated;