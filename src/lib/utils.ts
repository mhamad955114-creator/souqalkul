import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CoordinatePrecision = "low" | "medium" | "high";

export const COORD_PRECISION_DECIMALS: Record<CoordinatePrecision, number> = {
  low: 3,      // ~110 m
  medium: 5,   // ~1.1 m
  high: 6,     // ~11 cm
};

export const COORD_PRECISION_META: Record<CoordinatePrecision, { label: string; hint: string }> = {
  low: { label: "منخفضة", hint: "~110م — يخفي العنوان الدقيق" },
  medium: { label: "متوسطة", hint: "~1م — دقة الشارع" },
  high: { label: "عالية", hint: "~10سم — دقة كاملة" },
};

/** Format a lat/lng value to a consistent decimal string (default 6 decimals). */
export const formatCoordinate = (
  value: number | null | undefined,
  precision: CoordinatePrecision | number = "high"
): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  const decimals =
    typeof precision === "number" ? precision : COORD_PRECISION_DECIMALS[precision];
  return value.toFixed(decimals);
};

const PRECISION_KEY = "coord-precision";

export const getStoredCoordPrecision = (): CoordinatePrecision => {
  try {
    const v = localStorage.getItem(PRECISION_KEY);
    if (v === "low" || v === "medium" || v === "high") return v;
  } catch {
    // ignore
  }
  return "high";
};

export const setStoredCoordPrecision = (p: CoordinatePrecision) => {
  try {
    localStorage.setItem(PRECISION_KEY, p);
  } catch {
    // ignore
  }
};
