import { describe, expect, it } from "vitest";
import { MAX_VIDEO_MB, listingUiCopy } from "@/lib/listingLocalization";

describe("video upload limit", () => {
  it("allows videos up to 50 MB", () => {
    expect(MAX_VIDEO_MB).toBe(50);
  });

  it("shows the same limit in every language message and label", () => {
    for (const language of ["ar", "en", "tr"] as const) {
      expect(listingUiCopy[language].videoTooLarge).toContain(String(MAX_VIDEO_MB));
      expect(listingUiCopy[language].mediaCount(0, 60)).toContain(String(MAX_VIDEO_MB));
    }
  });
});
