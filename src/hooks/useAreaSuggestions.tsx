import { useEffect, useState } from "react";

interface AreaSuggestion {
  name: string;
  type?: string;
}

interface NominatimResult {
  display_name: string;
  type?: string;
  class?: string;
  address?: {
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    district?: string;
    village?: string;
    hamlet?: string;
    city_district?: string;
    residential?: string;
  };
}

const cacheKey = (city: string, country: string, lang: string) =>
  `area-suggestions:${lang}:${country.toLowerCase()}:${city.toLowerCase()}`;

/**
 * Fetches neighbourhood / district suggestions for a given city using Nominatim.
 * Results are cached in sessionStorage to minimize API calls.
 *
 * @param language - UI language code (e.g. "ar", "en", "tr") used as Accept-Language
 *                   so neighbourhood names come back in the user's language when possible.
 */
export function useAreaSuggestions(city: string, country: string, language: string = "ar") {
  const [suggestions, setSuggestions] = useState<AreaSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmedCity = city.trim();
    if (!trimmedCity || trimmedCity.length < 2) {
      setSuggestions([]);
      return;
    }

    // Check cache first
    try {
      const cached = sessionStorage.getItem(cacheKey(trimmedCity, country, language));
      if (cached) {
        setSuggestions(JSON.parse(cached));
        return;
      }
    } catch {
      // ignore
    }

    let cancelled = false;
    const controller = new AbortController();

    // Debounce to avoid hammering Nominatim while typing
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const query = `${trimmedCity}, ${country}`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=15&featuretype=suburb&q=${encodeURIComponent(
          query
        )}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": language },
        });
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as NominatimResult[];
        if (cancelled) return;

        // Extract neighbourhood-level names from results
        const seen = new Set<string>();
        const results: AreaSuggestion[] = [];
        for (const item of data) {
          const a = item.address || {};
          const candidates = [
            a.suburb,
            a.neighbourhood,
            a.quarter,
            a.district,
            a.city_district,
            a.residential,
            a.hamlet,
            a.village,
          ].filter(Boolean) as string[];

          for (const name of candidates) {
            const clean = name.trim();
            if (clean && !seen.has(clean) && clean !== trimmedCity) {
              seen.add(clean);
              results.push({ name: clean, type: item.type });
            }
          }
        }

        const sliced = results.slice(0, 8);
        setSuggestions(sliced);
        try {
          sessionStorage.setItem(cacheKey(trimmedCity, country, language), JSON.stringify(sliced));
        } catch {
          // ignore
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [city, country]);

  return { suggestions, loading };
}
