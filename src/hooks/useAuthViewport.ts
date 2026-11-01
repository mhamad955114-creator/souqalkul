import { useEffect, useState, type CSSProperties } from "react";

// The visual viewport, unlike 100vh, excludes the Android keyboard.
export function useAuthViewport(active = true) {
  const [viewport, setViewport] = useState(() => ({
    height: window.visualViewport?.height ?? window.innerHeight,
    top: window.visualViewport?.offsetTop ?? 0,
  }));

  useEffect(() => {
    if (!active) return;
    const visualViewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      setViewport({
        height: visualViewport?.height ?? window.innerHeight,
        top: visualViewport?.offsetTop ?? 0,
      });
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const focused = document.activeElement;
        if (focused instanceof HTMLElement && focused.matches("input, textarea") &&
            focused.closest(".auth-dialog, .auth-page")) {
          focused.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      });
    };
    update();
    visualViewport?.addEventListener("resize", update);
    visualViewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      visualViewport?.removeEventListener("resize", update);
      visualViewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [active]);

  return {
    "--auth-viewport-height": `${viewport.height}px`,
    "--auth-viewport-top": `${viewport.top}px`,
  } as CSSProperties;
}