import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContactSettings {
  email: string;
  phone: string;
  location: string;
  whatsapp: string;
}

export interface SocialSettings {
  facebook: string;
  instagram: string;
  twitter: string;
  snapchat: string;
  youtube: string;
}

const DEFAULT_CONTACT: ContactSettings = {
  email: "suopalkul5@gmail.com",
  phone: "+905350348850",
  location: "Damascus, Syria",
  whatsapp: "+905350348850",
};

const DEFAULT_SOCIAL: SocialSettings = {
  facebook: "",
  instagram: "",
  twitter: "",
  snapchat: "",
  youtube: "",
};

const toPlainString = (value: unknown, fallback: string) => {
  if (value == null) return fallback;
  if (typeof value === "string") return value || fallback;
  const asJson = JSON.stringify(value);
  const unquoted = asJson.replace(/^"|"$/g, "");
  return unquoted || fallback;
};

export const buildWhatsAppUrl = (phone: string, message = "") => {
  const digits = phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  const encoded = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${encoded}`;
};

const SOCIAL_KEY_MAP: Record<string, keyof SocialSettings> = {
  social_facebook: "facebook",
  social_instagram: "instagram",
  social_twitter: "twitter",
  social_snapchat: "snapchat",
  social_youtube: "youtube",
};

export const useContactSettings = () => {
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT);
  const [social, setSocial] = useState<SocialSettings>(DEFAULT_SOCIAL);
  const [loading, setLoading] = useState(true);

  const fetchContact = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listing_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "contact_email", "contact_phone", "contact_location", "contact_whatsapp",
        "social_facebook", "social_instagram", "social_twitter", "social_snapchat", "social_youtube",
      ]);

    if (!error && data) {
      const nextContact: ContactSettings = { ...DEFAULT_CONTACT };
      const nextSocial: SocialSettings = { ...DEFAULT_SOCIAL };

      for (const row of data as any[]) {
        if (row.setting_key === "contact_email") {
          nextContact.email = toPlainString(row.setting_value, DEFAULT_CONTACT.email);
        } else if (row.setting_key === "contact_phone") {
          nextContact.phone = toPlainString(row.setting_value, DEFAULT_CONTACT.phone);
        } else if (row.setting_key === "contact_location") {
          nextContact.location = toPlainString(row.setting_value, DEFAULT_CONTACT.location);
        } else if (row.setting_key === "contact_whatsapp") {
          nextContact.whatsapp = toPlainString(row.setting_value, DEFAULT_CONTACT.whatsapp);
        } else if (SOCIAL_KEY_MAP[row.setting_key]) {
          nextSocial[SOCIAL_KEY_MAP[row.setting_key]] = toPlainString(row.setting_value, "");
        }
      }
      setContact(nextContact);
      setSocial(nextSocial);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchContact();
  }, []);

  return useMemo(
    () => ({ contact, social, loading, refetch: fetchContact }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contact, social, loading]
  );
};
