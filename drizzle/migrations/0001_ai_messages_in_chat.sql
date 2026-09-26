ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_ai boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.notify_on_new_message()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _conversation RECORD;
  _receiver_id UUID;
  _sender_name TEXT;
  _listing_title TEXT;
  _pref_messages BOOLEAN;
BEGIN
  SELECT * INTO _conversation FROM public.conversations WHERE id = NEW.conversation_id;
  IF _conversation IS NULL THEN RETURN NEW; END IF;

  SELECT title INTO _listing_title FROM public.listings WHERE id = _conversation.listing_id;

  IF NEW.is_ai THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    SELECT u, 'رد جديد من المساعد الذكي',
           'في محادثة: ' || COALESCE(_listing_title, 'إعلان'),
           'new_message', _conversation.listing_id
    FROM unnest(ARRAY[_conversation.buyer_id, _conversation.seller_id]) AS u
    LEFT JOIN public.notification_preferences np ON np.user_id = u
    WHERE COALESCE(np.messages, true);
    RETURN NEW;
  END IF;

  IF NEW.sender_id = _conversation.buyer_id THEN
    _receiver_id := _conversation.seller_id;
  ELSE
    _receiver_id := _conversation.buyer_id;
  END IF;

  SELECT COALESCE(messages, true) INTO _pref_messages
  FROM public.notification_preferences WHERE user_id = _receiver_id;
  IF _pref_messages IS FALSE THEN RETURN NEW; END IF;

  SELECT COALESCE(full_name, 'مستخدم') INTO _sender_name FROM public.profiles WHERE user_id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (_receiver_id, 'رسالة جديدة من ' || _sender_name,
    'لديك رسالة جديدة بخصوص: ' || COALESCE(_listing_title, 'إعلان'),
    'new_message', _conversation.listing_id);
  RETURN NEW;
END;
$function$;