import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useAuthViewport } from "./useAuthViewport";

afterEach(() => vi.unstubAllGlobals());

it("tracks the keyboard's visible viewport and removes listeners on close", () => {
  const viewport = new EventTarget();
  Object.assign(viewport, { height: 780, offsetTop: 0 });
  vi.stubGlobal("visualViewport", viewport);
  const remove = vi.spyOn(viewport, "removeEventListener");
  const { result, unmount } = renderHook(() => useAuthViewport());
  expect(result.current["--auth-viewport-height" as keyof typeof result.current]).toBe("780px");
  act(() => {
    Object.assign(viewport, { height: 330, offsetTop: 25 });
    viewport.dispatchEvent(new Event("resize"));
  });
  expect(result.current["--auth-viewport-height" as keyof typeof result.current]).toBe("330px");
  expect(result.current["--auth-viewport-top" as keyof typeof result.current]).toBe("25px");
  unmount();
  expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
});