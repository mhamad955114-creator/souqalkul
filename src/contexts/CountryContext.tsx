import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { countries, getCountryByName, type CountryInfo } from "@/lib/constants";

interface CountryContextType {
  currentCountry: CountryInfo;
  setCountry: (name: string) => void;
  detecting: boolean;
  /** المدينة المكتشفة تلقائياً (أو المحددة يدوياً) داخل البلد الحالي */
  currentCity: string;
  setCity: (name: string) => void;
  detectingCity: boolean;
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

/** يوحّد النص للمقارنة: يزيل التشكيل، الهمزات، والأقواس التوضيحية */
function normalize(value: string): string {
  return value
    .replace(/\s*\(.*\)\s*$/u, "")
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase()
    .trim();
}

/** يطابق اسم مدينة قادم من خدمة خارجية مع قائمة مدن البلد */
function matchCity(countryName: string, candidates: (string | undefined)[]): string | null {
  const country = getCountryByName(countryName);
  if (!country) return null;

  for (const candidate of candidates) {
    if (!candidate) continue;
    const norm = normalize(candidate);
    if (!norm) continue;
    for (const city of country.cities) {
      const cityNorm = normalize(city);
      if (!cityNorm) continue;
      if (cityNorm === norm || cityNorm.includes(norm) || norm.includes(cityNorm)) {
        return city;
      }
    }
  }
  return null;
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const saved = localStorage.getItem("selectedCountry");
  const savedCity = localStorage.getItem("selectedCity") || "";
  const [currentCountry, setCurrentCountry] = useState<CountryInfo>(
    saved ? getCountryByName(saved) : countries[0]
  );
  const [currentCity, setCurrentCity] = useState<string>(savedCity);
  const [detecting, setDetecting] = useState(!saved);
  const [detectingCity, setDetectingCity] = useState(!savedCity);

  const setCountry = useCallback((name: string) => {
    const country = getCountryByName(name);
    setCurrentCountry(country);
    localStorage.setItem("selectedCountry", name);
    // تغيير البلد يدوياً يُلغي المدينة المكتشفة سابقاً
    setCurrentCity("");
    localStorage.removeItem("selectedCity");
  }, []);

  const setCity = useCallback((name: string) => {
    setCurrentCity(name);
    if (name) localStorage.setItem("selectedCity", name);
    else localStorage.removeItem("selectedCity");
  }, []);

  // Auto-detect country + city on first visit (IP based, no permission prompt)
  useEffect(() => {
    if (saved && savedCity) {
      setDetecting(false);
      setDetectingCity(false);
      return;
    }

    // Hard timeout — never let detection block the UI for more than 3s
    const hardStop = setTimeout(() => setDetecting(false), 3000);
    let cancelled = false;

    const detect = async () => {
      let countryName = saved || "";
      let latitude: number | undefined;
      let longitude: number | undefined;
      let ipCity: string | undefined;

      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const data = await res.json();
          ipCity = data.city;
          latitude = data.latitude;
          longitude = data.longitude;
          const detectedCountry = countryCodeMap[data.country_code];
          if (detectedCountry && !saved) {
            countryName = detectedCountry;
            if (!cancelled) {
              setCurrentCountry(getCountryByName(detectedCountry));
              localStorage.setItem("selectedCountry", detectedCountry);
            }
          }
        }
      } catch {
        // Fallback to default (Syria)
      } finally {
        clearTimeout(hardStop);
        if (!cancelled) setDetecting(false);
      }

      if (savedCity || cancelled) {
        setDetectingCity(false);
        return;
      }

      const country = countryName || currentCountry.name;

      // 1) محاولة سريعة: مطابقة اسم المدينة القادم من IP
      let city = matchCity(country, [ipCity]);

      // 2) إن فشلت، نحوّل الإحداثيات إلى اسم مدينة عربي عبر Nominatim
      if (!city && typeof latitude === "number" && typeof longitude === "number") {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar&addressdetails=1&zoom=10`,
            { signal: AbortSignal.timeout(4000) }
          );
          if (res.ok) {
            const data = await res.json();
            const a = data.address || {};
            city = matchCity(country, [a.city, a.town, a.state, a.county, a.municipality, a.province, a.village]);
          }
        } catch {
          // تجاهل — تبقى المدينة غير محددة
        }
      }

      if (!cancelled) {
        if (city) setCity(city);
        setDetectingCity(false);
      }
    };

    detect();
    return () => {
      cancelled = true;
      clearTimeout(hardStop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved, savedCity, setCity]);

  return (
    <CountryContext.Provider
      value={{ currentCountry, setCountry, detecting, currentCity, setCity, detectingCity }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}
