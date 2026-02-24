"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value from its previous value to the new one.
 * Returns the current animated value (as a number) and a key that
 * changes every time the value changes (useful to re-trigger CSS animations).
 */
export function useAnimatedNumber(target: number, duration = 400) {
  const [displayed, setDisplayed] = useState(target);
  const prev = useRef(target);
  const raf = useRef<number>(0);

  useEffect(() => {
    const from = prev.current;
    const to = target;
    if (from === to) return;

    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (to - from) * eased);
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      } else {
        prev.current = to;
        setDisplayed(to);
      }
    }

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return displayed;
}
