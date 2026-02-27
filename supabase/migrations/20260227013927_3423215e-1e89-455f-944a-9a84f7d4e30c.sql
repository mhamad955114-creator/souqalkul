-- Add metadata JSONB column to listings for category-specific details
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;