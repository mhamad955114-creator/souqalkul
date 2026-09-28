CREATE OR REPLACE FUNCTION public.get_listings_points(_listing_ids uuid[])
RETURNS TABLE(listing_id uuid, points integer, details jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT l.id,
    COALESCE(SUM(t.points), 0)::integer,
    COALESCE(jsonb_agg(jsonb_build_object('reason', t.reason, 'points', t.points, 'at', t.created_at) ORDER BY t.created_at) FILTER (WHERE t.id IS NOT NULL), '[]'::jsonb)
  FROM unnest(_listing_ids) AS l(id)
  LEFT JOIN public.listings li ON li.id = l.id
  LEFT JOIN public.reward_transactions t
    ON t.ref_key = l.id::text AND t.reason IN ('listing','sold') AND t.user_id = li.user_id
  GROUP BY l.id
$$;