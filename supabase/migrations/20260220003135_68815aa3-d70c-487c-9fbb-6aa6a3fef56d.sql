
-- Trigger: notify admins on new report
CREATE OR REPLACE FUNCTION public.notify_admins_on_new_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin RECORD;
  _listing_title TEXT;
BEGIN
  SELECT title INTO _listing_title FROM public.listings WHERE id = NEW.listing_id;

  FOR _admin IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (
      _admin.user_id,
      'بلاغ جديد',
      'تم استلام بلاغ جديد على الإعلان: ' || COALESCE(_listing_title, 'غير معروف') || ' - السبب: ' || NEW.reason,
      'admin_report',
      NEW.listing_id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_report_notify_admins
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_new_report();

-- Trigger: notify admins on new contact message
CREATE OR REPLACE FUNCTION public.notify_admins_on_new_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin RECORD;
BEGIN
  FOR _admin IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      _admin.user_id,
      'رسالة تواصل جديدة',
      'رسالة من ' || NEW.name || ': ' || NEW.subject,
      'admin_contact'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_contact_notify_admins
AFTER INSERT ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_new_contact();
