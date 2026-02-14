
-- Create a trigger function to notify users on new messages
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
BEGIN
  -- Get conversation details
  SELECT * INTO _conversation FROM public.conversations WHERE id = NEW.conversation_id;
  
  IF _conversation IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine receiver
  IF NEW.sender_id = _conversation.buyer_id THEN
    _receiver_id := _conversation.seller_id;
  ELSE
    _receiver_id := _conversation.buyer_id;
  END IF;

  -- Get sender name
  SELECT COALESCE(full_name, 'مستخدم') INTO _sender_name 
  FROM public.profiles WHERE user_id = NEW.sender_id;

  -- Get listing title
  SELECT title INTO _listing_title 
  FROM public.listings WHERE id = _conversation.listing_id;

  -- Insert notification for receiver
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

-- Create trigger on messages table
CREATE TRIGGER on_new_message_notify
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_message();
