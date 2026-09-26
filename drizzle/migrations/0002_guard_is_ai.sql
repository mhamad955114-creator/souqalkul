CREATE OR REPLACE FUNCTION public.guard_message_is_ai()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN NEW.is_ai := false; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_message_is_ai BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.guard_message_is_ai();