CREATE TABLE public.category_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);
GRANT SELECT, INSERT, DELETE ON public.category_follows TO authenticated;
GRANT ALL ON public.category_follows TO service_role;
ALTER TABLE public.category_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own follows select" ON public.category_follows FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own follows insert" ON public.category_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own follows delete" ON public.category_follows FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_category_follows_category ON public.category_follows (category);

CREATE OR REPLACE FUNCTION public.notify_category_followers()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _title text; _msg text;
BEGIN
  IF NEW.status IS DISTINCT FROM 'active' THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    _title := 'إعلان جديد في قسم تتابعه';
    _msg := NEW.title || ' — ' || NEW.price::text || ' ' || coalesce(NEW.currency,'');
  ELSE
    IF NEW.title IS NOT DISTINCT FROM OLD.title AND NEW.price IS NOT DISTINCT FROM OLD.price
       AND NEW.description IS NOT DISTINCT FROM OLD.description AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
      RETURN NEW;
    END IF;
    _title := 'تحديث على إعلان في قسم تتابعه';
    _msg := NEW.title || ' — ' || NEW.price::text || ' ' || coalesce(NEW.currency,'');
  END IF;
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  SELECT f.user_id, _title, _msg, 'listing_follow', NEW.id
  FROM public.category_follows f
  WHERE f.category = NEW.category AND f.user_id <> NEW.user_id;
  RETURN NEW;
END $$;

CREATE TRIGGER on_listing_notify_followers
AFTER INSERT OR UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.notify_category_followers();