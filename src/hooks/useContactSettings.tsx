import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContactSettings {
  email: string;
  phone: string;
  location: string;
  whatsapp: string;
}

const DEFAULT_CONTACT: ContactSettings = {
  email: "suopalkul5@gmail.com",
  phone: "+905350348850",
  location: "Damascus, Syria",
  whatsapp: "+905350348850",
};

const toPlainString = (value: unknown, fallback: string) => {
  if (value == null) return fallback;
  if (typeof value === "string") return value || fallback;

  // jsonb string sometimes arrives serialized; normalize
  const asJson = JSON.stringify(value);
  const unquoted = asJson.replace(/^"|"$/g, "");
  return unquoted || fallback;
};

export const buildWhatsAppUrl = (phone: string, message = "") => {
  const digits = phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  const encoded = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${encoded}`;
};

export const useContactSettings = () => {
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);

  const fetchContact = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listing_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["contact_email", "contact_phone", "contact_location", "contact_whatsapp"]);

    if (!error && data) {
      const next: ContactSettings = { ...DEFAULT_CONTACT };
      for (const row of data as any[]) {
        if (row.setting_key === "contact_email") {
          next.email = toPlainString(row.setting_value, DEFAULT_CONTACT.email);
        } else if (row.setting_key === "contact_phone") {
          next.phone = toPlainString(row.setting_value, DEFAULT_CONTACT.phone);
        } else if (row.setting_key === "contact_location") {
          next.location = toPlainString(row.setting_value, DEFAULT_CONTACT.location);
        } else if (row.setting_key === "contact_whatsapp") {
          next.whatsapp = toPlainString(row.setting_value, DEFAULT_CONTACT.whatsapp);
        }
      }
      setContact(next);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchContact();
  }, []);

  return useMemo(
    () => ({ contact, loading, refetch: fetchContact }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contact, loading]
  );
};
