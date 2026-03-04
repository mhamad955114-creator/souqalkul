import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(targetValue: number, duration = 800) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevValue = useRef(targetValue);
  const frameRef = useRef<number>();

  useEffect(() => {
    const start = prevValue.current;
    const end = targetValue;
    if (start === end) return;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [targetValue, duration]);

  return displayValue;
}
