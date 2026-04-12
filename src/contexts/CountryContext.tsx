import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { countries, getCountryByName, type CountryInfo } from "@/lib/constants";

interface CountryContextType {
  currentCountry: CountryInfo;
  setCountry: (name: string) => void;
  detecting: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

// Map of ISO country codes from geocoding to our country names
const countryCodeMap: Record<string, string> = {
  SY: "سوريا", TR: "تركيا", SA: "السعودية", AE: "الإمارات", EG: "مصر",
  IQ: "العراق", JO: "الأردن", LB: "لبنان", KW: "الكويت", QA: "قطر",
  BH: "البحرين", OM: "عُمان", YE: "اليمن", LY: "ليبيا", TN: "تونس",
  DZ: "الجزائر", MA: "المغرب", SD: "السودان", MR: "موريتانيا",
  PS: "فلسطين", SO: "الصومال", DJ: "جيبوتي", KM: "جزر القمر",
};

export function CountryProvider({ children }: { children: ReactNode }) {
  const saved = localStorage.getItem("selectedCountry");
  const [currentCountry, setCurrentCountry] = useState<CountryInfo>(
    saved ? getCountryByName(saved) : countries[0]
  );
  const [detecting, setDetecting] = useState(!saved);

  const setCountry = useCallback((name: string) => {
    const country = getCountryByName(name);
    setCurrentCountry(country);
    localStorage.setItem("selectedCountry", name);
  }, []);

  // Auto-detect country on first visit
  useEffect(() => {
    if (saved) return;
    
    const detect = async () => {
      try {
        // Use a free IP geolocation API
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          const countryName = countryCodeMap[data.country_code];
          if (countryName) {
            setCountry(countryName);
          }
        }
      } catch {
        // Fallback to default (Syria)
      } finally {
        setDetecting(false);
      }
    };
    detect();
  }, [saved, setCountry]);

  return (
    <CountryContext.Provider value={{ currentCountry, setCountry, detecting }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}
