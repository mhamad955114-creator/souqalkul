import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cities, areasByCity } from "@/lib/constants";

// Fallback: approximate coordinates for Syrian cities
const cityCoordinates: { name: string; lat: number; lng: number }[] = [
  { name: "دمشق", lat: 33.5138, lng: 36.2765 },
  { name: "ريف دمشق", lat: 33.45, lng: 36.35 },
  { name: "حلب", lat: 36.2021, lng: 37.1343 },
  { name: "حمص", lat: 34.7324, lng: 36.7137 },
  { name: "حماة", lat: 35.1318, lng: 36.7514 },
  { name: "اللاذقية", lat: 35.5317, lng: 35.7918 },
  { name: "طرطوس", lat: 34.8890, lng: 35.8866 },
  { name: "دير الزور", lat: 35.3359, lng: 40.1408 },
  { name: "الرقة", lat: 35.9528, lng: 39.0079 },
  { name: "الحسكة", lat: 36.5067, lng: 40.7440 },
  { name: "درعا", lat: 32.6189, lng: 36.1021 },
  { name: "السويداء", lat: 32.7127, lng: 36.5660 },
  { name: "إدلب", lat: 35.9306, lng: 36.6339 },
  { name: "القنيطرة", lat: 33.1256, lng: 35.8242 },
];

function findNearestCity(lat: number, lng: number): string {
  let nearest = cityCoordinates[0];
  let minDist = Infinity;

  for (const city of cityCoordinates) {
    const dist = Math.sqrt(
      Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  return nearest.name;
}

// Match reverse geocoding result to our known cities
function matchCity(addressParts: Record<string, string>): string | null {
  const fieldsToCheck = [
    addressParts.city,
    addressParts.town,
    addressParts.state,
    addressParts.county,
    addressParts.village,
    addressParts.municipality,
  ].filter(Boolean);

  for (const field of fieldsToCheck) {
    for (const city of cities) {
      if (field?.includes(city) || city.includes(field || "")) {
        return city;
      }
    }
  }
  return null;
}

// Match reverse geocoding result to our known areas
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

interface GeolocationResult {
  city: string;
  area?: string;
}

interface UseGeolocationReturn {
  loading: boolean;
  detectLocation: () => Promise<GeolocationResult | null>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [loading, setLoading] = useState(false);

  const detectLocation = useCallback(async (): Promise<GeolocationResult | null> => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return null;
    }

    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Try reverse geocoding with Nominatim (OpenStreetMap)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar&addressdetails=1&zoom=18`,
          { headers: { "User-Agent": "SyrianMarketApp/1.0" } }
        );

        if (response.ok) {
          const data = await response.json();
          const address = data.address || {};

          const matchedCity = matchCity(address);
          if (matchedCity) {
            const matchedArea = matchArea(matchedCity, address);
            const locationText = matchedArea
              ? `${matchedCity} - ${matchedArea}`
              : matchedCity;
            toast.success(`تم تحديد موقعك: ${locationText}`);
            return { city: matchedCity, area: matchedArea || undefined };
          }
        }
      } catch {
        // Reverse geocoding failed, fall through to fallback
      }

      // Fallback: nearest city by coordinates
      const city = findNearestCity(latitude, longitude);
      if (cities.includes(city)) {
        toast.success(`تم تحديد موقعك: ${city}`);
        return { city };
      }

      toast.error("لم نتمكن من تحديد مدينتك");
      return null;
    } catch (error: any) {
      if (error.code === 1) {
        toast.error("يرجى السماح بالوصول إلى موقعك");
      } else if (error.code === 3) {
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
