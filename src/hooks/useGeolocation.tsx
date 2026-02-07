import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cities } from "@/lib/constants";

// Approximate coordinates for Syrian cities
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

interface UseGeolocationReturn {
  loading: boolean;
  detectLocation: () => Promise<{ city: string } | null>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [loading, setLoading] = useState(false);

  const detectLocation = useCallback(async (): Promise<{ city: string } | null> => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return null;
    }

    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      const city = findNearestCity(latitude, longitude);

      if (cities.includes(city)) {
        toast.success(`تم تحديد موقعك: ${city}`);
        return { city };
      } else {
        toast.error("لم نتمكن من تحديد مدينتك");
        return null;
      }
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
