import { describe, expect, it } from "vitest";
import { defaultHeroTitles, normalizeHeroTitles } from "./heroTitle";

describe("localized admin headline settings", () => {
  it("applies the administrator's change only to the selected language", () => {
    const result = normalizeHeroTitles({ ar: { text: "عنوان مخصص", highlight: "جديد" } });
    expect(result.ar).toEqual({ text: "عنوان مخصص", highlight: "جديد" });
    expect(result.en).toEqual(defaultHeroTitles.en);
    expect(result.tr).toEqual(defaultHeroTitles.tr);
  });

  it("retains defaults for invalid or entirely empty settings", () => {
    expect(normalizeHeroTitles({ ar: { text: " ", highlight: " " } }).ar).toEqual(defaultHeroTitles.ar);
    expect(normalizeHeroTitles(null)).toEqual(defaultHeroTitles);
  });
});