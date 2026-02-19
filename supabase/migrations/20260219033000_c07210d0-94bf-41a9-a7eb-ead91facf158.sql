
-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_notification_send_push ON public.notifications;
DROP FUNCTION IF EXISTS public.send_push_on_notification();

-- Recreate with hardcoded project URL (safe since it's internal)
CREATE OR REPLACE FUNCTION public.send_push_on_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://dhkdgdehcwcglhntsegs.supabase.co/functions/v1/send-push-notification',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.title,
      'message', NEW.message,
      'type', NEW.type,
      'related_id', NEW.related_id
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Push notification send failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_notification_send_push
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.send_push_on_notification();
