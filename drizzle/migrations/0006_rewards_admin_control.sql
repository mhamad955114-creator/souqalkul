CREATE OR REPLACE FUNCTION public.get_rewards_config()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'enabled', true, 'listing', 5, 'listing_daily_cap', 5, 'sold', 10, 'rating_given', 2,
    'rating_received', 5, 'daily', 2, 'referral', 20, 'referred', 10, 'referral_window_days', 7,
    'redeem_days', 7, 'cost_featured', 100, 'cost_professional', 250, 'cost_business', 500
  ) || COALESCE((SELECT setting_value FROM public.admin_settings WHERE setting_key = 'rewards_config'), '{}'::jsonb)
$$;

CREATE OR REPLACE FUNCTION public.rcfg_int(_k text) RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((public.get_rewards_config() ->> _k)::integer, 0)
$$;
CREATE OR REPLACE FUNCTION public.rewards_enabled() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((public.get_rewards_config() ->> 'enabled')::boolean, true)
$$;

CREATE OR REPLACE FUNCTION public.admin_set_rewards_config(_config jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  INSERT INTO public.admin_settings (setting_key, setting_value, updated_by, updated_at)
  VALUES ('rewards_config', _config, auth.uid(), now())
  ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_by = auth.uid(), updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.admin_adjust_points(_user_id uuid, _points integer, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF _points = 0 THEN RAISE EXCEPTION 'Invalid points'; END IF;
  INSERT INTO public.reward_transactions (user_id, points, reason, ref_key)
  VALUES (_user_id, _points, 'admin', COALESCE(NULLIF(_note,''), '-') || '|' || gen_random_uuid()::text);
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (_user_id, 'تحديث نقاط المكافآت',
    CASE WHEN _points > 0 THEN 'أضافت الإدارة ' ELSE 'خصمت الإدارة ' END || abs(_points) || ' نقطة' || COALESCE(' - ' || NULLIF(_note,''), ''), 'rewards');
END $$;

CREATE OR REPLACE FUNCTION public.admin_rewards_users(_search text DEFAULT NULL)
RETURNS TABLE(user_id uuid, full_name text, balance integer, earned integer, tx_count integer, last_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN QUERY
  SELECT p.user_id, p.full_name,
    COALESCE(SUM(t.points),0)::integer,
    COALESCE(SUM(t.points) FILTER (WHERE t.points > 0),0)::integer,
    COUNT(t.id)::integer, MAX(t.created_at)
  FROM public.profiles p
  LEFT JOIN public.reward_transactions t ON t.user_id = p.user_id
  WHERE _search IS NULL OR _search = '' OR p.full_name ILIKE '%' || _search || '%' OR p.user_id::text LIKE lower(_search) || '%'
  GROUP BY p.user_id, p.full_name
  ORDER BY 3 DESC, 6 DESC NULLS LAST
  LIMIT 100;
END $$;

CREATE OR REPLACE FUNCTION public.reward_on_listing()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _today integer;
BEGIN
  IF NOT public.rewards_enabled() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    SELECT count(*) INTO _today FROM public.reward_transactions
    WHERE user_id = NEW.user_id AND reason = 'listing' AND created_at > now() - interval '1 day';
    IF _today < public.rcfg_int('listing_daily_cap') AND public.rcfg_int('listing') > 0 THEN
      PERFORM public.award_points(NEW.user_id, public.rcfg_int('listing'), 'listing', NEW.id::text);
    END IF;
  ELSIF NEW.status = 'sold' AND OLD.status IS DISTINCT FROM 'sold' AND public.rcfg_int('sold') > 0 THEN
    PERFORM public.award_points(NEW.user_id, public.rcfg_int('sold'), 'sold', NEW.id::text);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.reward_on_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.rewards_enabled() THEN RETURN NEW; END IF;
  IF public.rcfg_int('rating_given') > 0 THEN
    PERFORM public.award_points(NEW.reviewer_id, public.rcfg_int('rating_given'), 'rating_given', NEW.id::text);
  END IF;
  IF NEW.rating >= 4 AND public.rcfg_int('rating_received') > 0 THEN
    PERFORM public.award_points(NEW.seller_id, public.rcfg_int('rating_received'), 'rating_received', NEW.id::text);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.claim_daily_reward()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF NOT public.rewards_enabled() OR public.rcfg_int('daily') <= 0 THEN RETURN false; END IF;
  RETURN public.award_points(auth.uid(), public.rcfg_int('daily'), 'daily', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD'));
END $$;

CREATE OR REPLACE FUNCTION public.apply_referral(_code text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _me uuid := auth.uid(); _referrer uuid; _created timestamptz;
BEGIN
  IF _me IS NULL THEN RETURN 'unauthorized'; END IF;
  IF NOT public.rewards_enabled() THEN RETURN 'disabled'; END IF;
  IF _code IS NULL OR _code !~ '^[0-9a-fA-F]{8}$' THEN RETURN 'invalid'; END IF;
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = _me) THEN RETURN 'already'; END IF;
  SELECT created_at INTO _created FROM auth.users WHERE id = _me;
  IF _created < now() - (public.rcfg_int('referral_window_days') || ' days')::interval THEN RETURN 'too_late'; END IF;
  SELECT user_id INTO _referrer FROM public.profiles WHERE user_id::text LIKE lower(_code) || '%' LIMIT 1;
  IF _referrer IS NULL THEN RETURN 'invalid'; END IF;
  IF _referrer = _me THEN RETURN 'self'; END IF;
  INSERT INTO public.referrals (referrer_id, referred_id) VALUES (_referrer, _me);
  IF public.rcfg_int('referral') > 0 THEN PERFORM public.award_points(_referrer, public.rcfg_int('referral'), 'referral', _me::text); END IF;
  IF public.rcfg_int('referred') > 0 THEN PERFORM public.award_points(_me, public.rcfg_int('referred'), 'referred', _referrer::text); END IF;
  RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION public.redeem_reward(_plan_type text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _me uuid := auth.uid(); _cost integer; _balance integer; _days integer;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF NOT public.rewards_enabled() THEN RETURN 'disabled'; END IF;
  IF _plan_type NOT IN ('featured','professional','business') THEN RETURN 'invalid'; END IF;
  _cost := public.rcfg_int('cost_' || _plan_type);
  _days := public.rcfg_int('redeem_days');
  IF _cost <= 0 OR _days <= 0 THEN RETURN 'invalid'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('reward:' || _me::text));
  SELECT COALESCE(SUM(points),0) INTO _balance FROM public.reward_transactions WHERE user_id = _me;
  IF _balance < _cost THEN RETURN 'insufficient'; END IF;
  INSERT INTO public.reward_transactions (user_id, points, reason, ref_key)
  VALUES (_me, -_cost, 'redeem_' || _plan_type, gen_random_uuid()::text);
  INSERT INTO public.user_subscriptions (user_id, plan_type, expires_at, status)
  VALUES (_me, _plan_type, now() + (_days || ' days')::interval, 'active');
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (_me, 'تم استبدال نقاطك', 'تم تفعيل باقة ' || _plan_type || ' لمدة ' || _days || ' أيام', 'subscription');
  RETURN 'ok';
END $$;