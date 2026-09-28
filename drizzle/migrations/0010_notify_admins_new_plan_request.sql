CREATE OR REPLACE FUNCTION public.notify_admins_on_plan_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _name text;
BEGIN
  SELECT full_name INTO _name FROM public.profiles WHERE user_id = NEW.user_id;
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  SELECT ur.user_id, 'طلب باقة جديد',
    COALESCE(_name, 'مستخدم') || ' طلب باقة ' || COALESCE(NEW.plan_type, '') || ' — اضغط للمراجعة والقبول',
    'admin', NEW.id
  FROM public.user_roles ur WHERE ur.role = 'admin';
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_admins_plan_request ON public.top_up_requests;
CREATE TRIGGER trg_notify_admins_plan_request AFTER INSERT ON public.top_up_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_plan_request();