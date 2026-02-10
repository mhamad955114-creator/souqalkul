
-- Function to notify interested buyers when a listing is marked as sold
CREATE OR REPLACE FUNCTION public.notify_buyers_on_sold()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only trigger when status changes to 'sold'
  IF NEW.status = 'sold' AND (OLD.status IS DISTINCT FROM 'sold') THEN
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
  RETURN NEW;
END;
$$;

-- Create trigger on listings table
CREATE TRIGGER on_listing_sold
  AFTER UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_buyers_on_sold();
