import { useState, useCallback } from "react";
import { toast } from "sonner";
import { countries, areasByCity } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";

interface GeolocationResult {
  city: string;
  area?: string;
  country: string;
}

interface UseGeolocationReturn {
  loading: boolean;
  detectLocation: () => Promise<GeolocationResult | null>;
}

// Map Nominatim country_code (ISO-3166-1 alpha-2) → our country name in Arabic
const countryCodeToName: Record<string, string> = {
  sy: "سوريا",
  tr: "تركيا",
  sa: "السعودية",
  ae: "الإمارات",
  eg: "مصر",
  iq: "العراق",
  jo: "الأردن",
  lb: "لبنان",
  kw: "الكويت",
  qa: "قطر",
  bh: "البحرين",
  om: "عمان",
  ye: "اليمن",
  ly: "ليبيا",
  tn: "تونس",
  dz: "الجزائر",
  ma: "المغرب",
  sd: "السودان",
  ps: "فلسطين",
  mr: "موريتانيا",
  so: "الصومال",
  dj: "جيبوتي",
  km: "جزر القمر",
};

// Find which country in our list matches the Nominatim country_code / display name
function matchCountry(countryCode?: string, countryName?: string): string | null {
  if (countryCode) {
    const fromCode = countryCodeToName[countryCode.toLowerCase()];
    if (fromCode && countries.some((c) => c.name === fromCode)) return fromCode;
  }
  if (countryName) {
    for (const c of countries) {
      if (countryName.includes(c.name) || c.name.includes(countryName)) return c.name;
    }
  }
  return null;
}

// Match a city within a specific country's city list
function matchCityInCountry(
  countryName: string,
  addressParts: Record<string, string>
): string | null {
  const country = countries.find((c) => c.name === countryName);
  if (!country) return null;

  const fieldsToCheck = [
    addressParts.city,
    addressParts.town,
    addressParts.state,
    addressParts.county,
    addressParts.village,
    addressParts.municipality,
    addressParts.province,
  ].filter(Boolean);

  for (const field of fieldsToCheck) {
    for (const city of country.cities) {
      // Strip parenthesised disambiguators like "صور (عمان)" before comparing
      const cityClean = city.replace(/\s*\(.*\)\s*$/u, "").trim();
      if (
        field?.includes(cityClean) ||
        cityClean.includes(field || "") ||
        field?.includes(city) ||
        city.includes(field || "")
      ) {
        return city;
      }
    }
  }
  return null;
}

function matchArea(city: string, addressParts: Record<string, string>): string | null {
  const areas = areasByCity[city];
  if (!areas || areas.length === 0) return null;

  const fieldsToCheck = [
    addressParts.suburb,
    addressParts.neighbourhood,
    addressParts.quarter,
    addressParts.district,
    addressParts.village,
    addressParts.town,
    addressParts.road,
  ].filter(Boolean);

  for (const field of fieldsToCheck) {
    for (const area of areas) {
      if (field?.includes(area) || area.includes(field || "")) {
        return area;
      }
    }
  }
  return null;
}

export function useGeolocation(): UseGeolocationReturn {
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();

  const detectLocation = useCallback(async (): Promise<GeolocationResult | null> => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return null;
    }

    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar&addressdetails=1&zoom=14`,
        { headers: { "User-Agent": "SouqAlkulApp/1.0" } }
      );

      if (!response.ok) {
        toast.error("تعذّر تحديد موقعك، حاول مرة أخرى");
        return null;
      }

      const data = await response.json();
      const address = data.address || {};

      // 1) Identify the country first
      const matchedCountry = matchCountry(address.country_code, address.country);
      if (!matchedCountry) {
        toast.error(
          `موقعك (${address.country || "غير معروف"}) غير مدعوم في التطبيق حالياً`
        );
        return null;
      }

      // 2) Then match a city inside that country
      const matchedCity = matchCityInCountry(matchedCountry, address);
      if (!matchedCity) {
        toast.error(
          `تم تحديد دولتك (${matchedCountry}) لكن لم نتعرّف على مدينتك، اختر يدوياً`
        );
        return { city: "", country: matchedCountry };
      }

      const matchedArea = matchArea(matchedCity, address);
      const locationText = matchedArea
        ? `${matchedCountry} - ${matchedCity} - ${matchedArea}`
        : `${matchedCountry} - ${matchedCity}`;
      toast.success(`تم تحديد موقعك: ${locationText}`);
      return {
        city: matchedCity,
        area: matchedArea || undefined,
        country: matchedCountry,
      };
    } catch (error: unknown) {
      const code = (error as { code?: number })?.code;
      if (code === 1) {
        toast.error("يرجى السماح بالوصول إلى موقعك");
      } else if (code === 3) {
        toast.error("انتهت مهلة تحديد الموقع، حاول مجدداً");
      } else {
        toast.error("فشل تحديد الموقع");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, detectLocation };
}
