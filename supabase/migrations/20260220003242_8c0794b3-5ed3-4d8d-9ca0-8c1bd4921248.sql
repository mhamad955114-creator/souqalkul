
-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  messages boolean NOT NULL DEFAULT true,
  updates boolean NOT NULL DEFAULT true,
  offers boolean NOT NULL DEFAULT true,
  admin_alerts boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Auto-create preferences for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_prefs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_notification_prefs
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_notification_prefs();

-- Update notify_on_new_message to check preferences
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _conversation RECORD;
  _receiver_id UUID;
  _sender_name TEXT;
  _listing_title TEXT;
  _pref_messages BOOLEAN;
BEGIN
  SELECT * INTO _conversation FROM public.conversations WHERE id = NEW.conversation_id;
  IF _conversation IS NULL THEN RETURN NEW; END IF;

  IF NEW.sender_id = _conversation.buyer_id THEN
    _receiver_id := _conversation.seller_id;
  ELSE
    _receiver_id := _conversation.buyer_id;
  END IF;

  -- Check receiver's notification preference
  SELECT COALESCE(messages, true) INTO _pref_messages
  FROM public.notification_preferences WHERE user_id = _receiver_id;
  
  IF _pref_messages IS FALSE THEN RETURN NEW; END IF;

  SELECT COALESCE(full_name, 'مستخدم') INTO _sender_name 
  FROM public.profiles WHERE user_id = NEW.sender_id;

  SELECT title INTO _listing_title 
  FROM public.listings WHERE id = _conversation.listing_id;

  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (
    _receiver_id,
    'رسالة جديدة من ' || _sender_name,
    'لديك رسالة جديدة بخصوص: ' || COALESCE(_listing_title, 'إعلان'),
    'new_message',
    _conversation.listing_id
  );

  RETURN NEW;
END;
$$;

-- Update notify_buyers_on_sold to check preferences
CREATE OR REPLACE FUNCTION public.notify_buyers_on_sold()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'sold' AND (OLD.status IS DISTINCT FROM 'sold') THEN
    NEW.sold_at = now();
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    SELECT DISTINCT
      c.buyer_id,
      NEW.title,
      'تم بيع الإعلان: ' || NEW.title,
      'listing_sold',
      NEW.id
    FROM public.conversations c
    LEFT JOIN public.notification_preferences np ON np.user_id = c.buyer_id
    WHERE c.listing_id = NEW.id
      AND c.buyer_id != NEW.user_id
      AND COALESCE(np.updates, true) = true;
  END IF;

  IF NEW.status = 'active' AND OLD.status = 'sold' THEN
    NEW.sold_at = NULL;
  END IF;

  RETURN NEW;
END;
$$;
