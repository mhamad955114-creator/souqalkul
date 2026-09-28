ALTER TABLE public.custom_plans
ADD COLUMN glow_color2 text NOT NULL DEFAULT '#fb923c' CHECK (glow_color2 ~ '^#[0-9A-Fa-f]{6}$');

COMMENT ON COLUMN public.custom_plans.glow_color2 IS 'Secondary glow color used with color for the custom package listing border.';