import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/logo.png";

interface BrandContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  isDefaultLogo: boolean;
}

const BrandContext = createContext<BrandContextType>({
  logoUrl: defaultLogo,
  setLogoUrl: () => {},
  isDefaultLogo: true,
});

export const useBrand = () => useContext(BrandContext);

const normalizeUrl = (val: unknown): string | null => {
  if (!val) return null;
  if (typeof val === "string") {
    const clean = val.replace(/^"|"$/g, "");
    return clean && clean !== "null" ? clean : null;
  }
  const asJson = JSON.stringify(val).replace(/^"|"$/g, "");
  return asJson && asJson !== "null" ? asJson : null;
};

const updateFavicon = (url: string) => {
  document
    .querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
    .forEach((el) => {
      el.href = url;
    });
};

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [logoUrl, setLogoUrlState] = useState<string>(defaultLogo);

  useEffect(() => {
    const fetchBrand = async () => {
      const { data } = await supabase
        .from("listing_settings")
        .select("setting_value")
        .eq("setting_key", "brand_logo_url")
        .maybeSingle();

      if (data?.setting_value) {
        const url = normalizeUrl(data.setting_value);
        if (url) {
          setLogoUrlState(url);
          updateFavicon(url);
        }
      }
    };

    fetchBrand();
  }, []);

  const setLogoUrl = (url: string) => {
    const effective = url || defaultLogo;
    setLogoUrlState(effective);
    updateFavicon(effective);
  };

  const isDefaultLogo = logoUrl === defaultLogo;

  return (
    <BrandContext.Provider value={{ logoUrl, setLogoUrl, isDefaultLogo }}>
      {children}
    </BrandContext.Provider>
  );
};
