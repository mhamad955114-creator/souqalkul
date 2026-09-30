CREATE OR REPLACE FUNCTION public.normalize_arabic_search(_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT trim(
    regexp_replace(
      translate(
        regexp_replace(lower(coalesce(_value, '')), '[\u064B-\u065F\u0670\u0640]', '', 'g'),
        'أإآٱىؤئة',
        'اااايويه'
      ),
      '[^[:alnum:]\u0600-\u06FF]+',
      ' ',
      'g'
    )
  );
$$;

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS search_text text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.refresh_listing_search_text()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_text := public.normalize_arabic_search(
    concat_ws(' ', NEW.title, NEW.description, NEW.category, NEW.country, NEW.city, NEW.area, NEW.metadata::text)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS refresh_listing_search_text_trigger ON public.listings;
CREATE TRIGGER refresh_listing_search_text_trigger
BEFORE INSERT OR UPDATE OF title, description, category, country, city, area, metadata
ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.refresh_listing_search_text();

UPDATE public.listings
SET search_text = public.normalize_arabic_search(
  concat_ws(' ', title, description, category, country, city, area, metadata::text)
);

CREATE INDEX IF NOT EXISTS listings_search_text_idx
ON public.listings USING gin (to_tsvector('simple', search_text));

GRANT EXECUTE ON FUNCTION public.normalize_arabic_search(text) TO anon, authenticated, service_role;