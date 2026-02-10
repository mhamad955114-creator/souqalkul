-- Update RLS policy to also show sold listings publicly
DROP POLICY "Active listings are viewable by everyone" ON public.listings;
CREATE POLICY "Active and sold listings are viewable by everyone"
ON public.listings
FOR SELECT
USING ((status IN ('active', 'sold')) OR (auth.uid() = user_id));
