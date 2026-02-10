
-- Add sold_at column to track when listing was marked as sold
ALTER TABLE public.listings ADD COLUMN sold_at timestamp with time zone DEFAULT NULL;

-- Update the notify trigger to also set sold_at
CREATE OR REPLACE FUNCTION public.notify_buyers_on_sold()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'sold' AND (OLD.status IS DISTINCT FROM 'sold') THEN
    -- Set sold_at timestamp
    NEW.sold_at = now();

    -- Notify interested buyers
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    SELECT DISTINCT
      c.buyer_id,
      NEW.title,
      'تم بيع الإعلان: ' || NEW.title,
      'listing_sold',
      NEW.id
    FROM public.conversations c
    WHERE c.listing_id = NEW.id
      AND c.buyer_id != NEW.user_id;
  END IF;

  -- Clear sold_at if reactivated
  IF NEW.status = 'active' AND OLD.status = 'sold' THEN
    NEW.sold_at = NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger as BEFORE UPDATE so we can modify NEW
DROP TRIGGER IF EXISTS on_listing_sold ON public.listings;
CREATE TRIGGER on_listing_sold
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_buyers_on_sold();

-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on cron schema
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
