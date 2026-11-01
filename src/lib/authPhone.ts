import { countries, type CountryInfo } from "@/lib/constants";

export function normalizeAuthPhone(value: string, country: CountryInfo): string {
  const cleaned = value.replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  return country.phoneCode + cleaned.replace(/^0/, "");
}

export function phoneCountryByCode(code: string | null | undefined) {
  return countries.find((country) => country.code === code?.toUpperCase());
}

export function timezonePhoneCountry(timezone: string) {
  const codes: Record<string, string> = {
    "Europe/Istanbul": "TR", "Asia/Istanbul": "TR", "Asia/Riyadh": "SA",
    "Asia/Damascus": "SY", "Asia/Dubai": "AE", "Africa/Cairo": "EG",
    "Asia/Baghdad": "IQ", "Asia/Amman": "JO", "Asia/Beirut": "LB",
    "Asia/Qatar": "QA", "Asia/Kuwait": "KW", "Asia/Bahrain": "BH", "Asia/Muscat": "OM",
  };
  return phoneCountryByCode(codes[timezone]);
}