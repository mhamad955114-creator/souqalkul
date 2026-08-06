import { areasByCity } from "@/lib/constants";

const norm = (v: string) =>
  (v || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Find the closest city from a known list for a reverse-geocoded city name / full address */
export const matchCity = (
  candidate: string | undefined,
  displayName: string | undefined,
  cities: string[]
): string | null => {
  const cand = norm(candidate || "");
  if (cand) {
    const exact = cities.find((c) => norm(c) === cand);
    if (exact) return exact;
    const partial = cities.find((c) => norm(c).includes(cand) || cand.includes(norm(c)));
    if (partial) return partial;
  }
  const full = norm(displayName || "");
  if (full) {
    const inFull = cities.find((c) => full.includes(norm(c)));
    if (inFull) return inFull;
  }
  return null;
};

/** Match an area against the predefined areas of a city (returns null when free text should be used) */
export const matchArea = (candidate: string | undefined, city: string): string | null => {
  const list = areasByCity[city] || [];
  const cand = norm(candidate || "");
  if (!cand || list.length === 0) return null;
  return (
    list.find((a) => norm(a) === cand) ||
    list.find((a) => norm(a).includes(cand) || cand.includes(norm(a))) ||
    null
  );
};

export interface ResolvedAddressLike {
  displayName?: string;
  country?: string;
  city?: string;
  area?: string;
}

/**
 * Resolve city/area values to fill into the listing form from a reverse-geocoded address.
 * `allowCustomCity` lets the caller keep the raw city name when it's not in the known list.
 */
export const resolveCityArea = (
  address: ResolvedAddressLike,
  cities: string[],
  allowCustomCity = true
): { city: string | null; area: string | null } => {
  const matchedCity = matchCity(address.city, address.displayName, cities);
  const city = matchedCity || (allowCustomCity && address.city ? address.city : null);
  if (!city) return { city: null, area: null };
  const knownArea = matchArea(address.area, city);
  const hasPredefined = (areasByCity[city] || []).length > 0;
  const area = knownArea || (!hasPredefined && address.area ? address.area : null);
  return { city, area };
};
