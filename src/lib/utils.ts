import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a lat/lng value to a consistent 6-decimal string. */
export const formatCoordinate = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  return value.toFixed(6);
};
