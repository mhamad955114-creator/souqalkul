import { useEffect, useState } from "react";

export interface AreaSuggestion {
  name: string;
  type?: string;
  /** Internal relevance weight (higher = more relevant). */
  score?: number;
}

interface NominatimResult {
  display_name: string;
  type?: string;
  class?: string;
  importance?: number;
  address?: {
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    district?: string;
    village?: string;
    hamlet?: string;
    city_district?: string;
    residential?: string;
    town?: string;
  };
}

const cacheKey = (city: string, country: string, lang: string) =>
  `area-suggestions:${lang}:${country.toLowerCase()}:${city.toLowerCase()}`;

/* -------------------- normalization & ranking helpers -------------------- */

/** Normalize Arabic + Latin text for comparison: strip diacritics, unify alef/ya/ta-marbuta, lowercase. */
export function normalizeAreaText(input: string): string {
  if (!input) return "";
  let s = input.normalize("NFKD").replace(/[\u064B-\u065F\u0670]/g, ""); // remove tashkeel
  s = s
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه");
  s = s.replace(/[\u0300-\u036f]/g, ""); // latin diacritics
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Weight per address feature type — more specific = higher. */
const TYPE_WEIGHT: Record<string, number> = {
  neighbourhood: 100,
  suburb: 95,
  quarter: 90,
  city_district: 85,
  district: 80,
  residential: 70,
  village: 50,
  hamlet: 40,
  town: 30,
};

function pickBestCandidate(a: NonNullable<NominatimResult["address"]>): { name: string; weight: number; type: string } | null {
  const ordered: Array<[string, string | undefined]> = [
    ["neighbourhood", a.neighbourhood],
    ["suburb", a.suburb],
    ["quarter", a.quarter],
    ["city_district", a.city_district],
    ["district", a.district],
    ["residential", a.residential],
    ["village", a.village],
    ["hamlet", a.hamlet],
    ["town", a.town],
  ];
  for (const [type, val] of ordered) {
    if (val && val.trim()) return { name: val.trim(), weight: TYPE_WEIGHT[type] ?? 10, type };
  }
  return null;
}

/**
 * Merge & rank suggestions with case/diacritic-insensitive dedup.
 * Keeps the highest-scored variant per normalized key and preserves original casing.
 */
function mergeAndRank(items: AreaSuggestion[], cityNorm: string): AreaSuggestion[] {
  const map = new Map<string, AreaSuggestion>();
  for (const it of items) {
    const key = normalizeAreaText(it.name);
    if (!key || key === cityNorm) continue;
    const prev = map.get(key);
    if (!prev || (it.score ?? 0) > (prev.score ?? 0)) {
      map.set(key, it);
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/**
 * Public filter helper used by UI: ranks matches by
 *   prefix > word-start > substring, then by base score.
 * Diacritic/case-insensitive.
 */
export function filterAreaSuggestions(
  suggestions: AreaSuggestion[],
  query: string,
  limit = 8
): AreaSuggestion[] {
  const q = normalizeAreaText(query);
  if (!q) return suggestions.slice(0, limit);

  const scored = suggestions
    .map((s) => {
      const n = normalizeAreaText(s.name);
      let bonus = -1;
      if (n.startsWith(q)) bonus = 300;
      else if (new RegExp(`(^|\\s)${q.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}`).test(n)) bonus = 200;
      else if (n.includes(q)) bonus = 100;
      return bonus < 0 ? null : { ...s, score: (s.score ?? 0) + bonus };
    })
    .filter(Boolean) as AreaSuggestion[];

  return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, limit);
}

/* ------------------------------ main hook ------------------------------ */

/**
 * Fetches neighbourhood / district suggestions for a given city using Nominatim.
 * Combines two query strategies (free-form + structured) for broader coverage,
 * then merges, dedupes (diacritic-insensitive) and ranks by feature specificity
 * and Nominatim importance.
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

    // Cache hit
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
    const cityNorm = normalizeAreaText(trimmedCity);

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const headers = { "Accept-Language": language };
        const freeQ = `${trimmedCity}, ${country}`;
        const urls = [
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=20&q=${encodeURIComponent(freeQ)}`,
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=20&city=${encodeURIComponent(trimmedCity)}&country=${encodeURIComponent(country)}`,
        ];

        const responses = await Promise.allSettled(
          urls.map((u) => fetch(u, { signal: controller.signal, headers }).then((r) => (r.ok ? r.json() : [])))
        );
        if (cancelled) return;

        const all: NominatimResult[] = responses.flatMap((r) =>
          r.status === "fulfilled" ? (r.value as NominatimResult[]) : []
        );

        const collected: AreaSuggestion[] = [];
        for (const item of all) {
          const a = item.address;
          if (!a) continue;
          const best = pickBestCandidate(a);
          if (!best) continue;
          const importanceBoost = Math.round((item.importance ?? 0) * 50);
          collected.push({
            name: best.name,
            type: best.type,
            score: best.weight + importanceBoost,
          });
        }

        const merged = mergeAndRank(collected, cityNorm).slice(0, 12);
        setSuggestions(merged);
        try {
          sessionStorage.setItem(cacheKey(trimmedCity, country, language), JSON.stringify(merged));
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
  }, [city, country, language]);

  return { suggestions, loading };
}
