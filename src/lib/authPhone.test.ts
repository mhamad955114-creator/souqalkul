import { describe, expect, it } from "vitest";
import { normalizeAuthPhone, phoneCountryByCode, timezonePhoneCountry } from "./authPhone";

describe("location-based authentication phone numbers", () => {
  it("uses Turkey for Istanbul and converts local 05 to +90", () => {
    const country = timezonePhoneCountry("Europe/Istanbul");
    expect(country?.code).toBe("TR");
    if (!country) throw new Error("Turkey missing");
    expect(normalizeAuthPhone("05351234567", country)).toBe("+905351234567");
  });
  it("uses Saudi +966 and removes the local leading zero", () => {
    const country = phoneCountryByCode("SA");
    if (!country) throw new Error("Saudi Arabia missing");
    expect(normalizeAuthPhone("0551234567", country)).toBe("+966551234567");
  });
  it("keeps explicit international numbers even in a different country", () => {
    const country = phoneCountryByCode("TR");
    if (!country) throw new Error("Turkey missing");
    expect(normalizeAuthPhone("+966551234567", country)).toBe("+966551234567");
    expect(normalizeAuthPhone("00966551234567", country)).toBe("+966551234567");
  });
});