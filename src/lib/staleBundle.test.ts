import { describe, expect, it } from "vitest";
import { isStaleBundleError } from "@/lib/staleBundle";

describe("stale bundle detection", () => {
  it("detects the blank-screen crash where React hooks resolve to null", () => {
    expect(
      isStaleBundleError(new TypeError("Cannot read properties of null (reading 'useEffect')")),
    ).toBe(true);
  });

  it("detects a duplicated React instance", () => {
    expect(
      isStaleBundleError(
        new Error("Invalid hook call. Hooks can only be called inside the body of a function component."),
      ),
    ).toBe(true);
  });

  it("leaves ordinary errors to the manual retry card", () => {
    expect(isStaleBundleError(new TypeError("foo is not a function"))).toBe(false);
    expect(isStaleBundleError(new Error("Unexpected token '<'"))).toBe(false);
    expect(isStaleBundleError(null)).toBe(false);
  });
});
