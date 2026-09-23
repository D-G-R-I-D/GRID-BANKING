"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animate a number towards `target` (ease-out, ~0.7s) whenever it changes —
 * e.g. a balance after money arrives. Starts at `from` if given, else at the
 * target (no animation on first paint). Instant under prefers-reduced-motion.
 * Always yields integers, so it's safe for minor units.
 */
export function useCountUp(target: number, from?: number, duration = 700) {
  const [value, setValue] = useState(from ?? target);
  const shown = useRef(from ?? target);

  useEffect(() => {
    const start = shown.current;
    if (start === target) return;
    const instant = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = instant ? 1 : Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) ** 3;
      const next = Math.round(start + (target - start) * eased);
      shown.current = next;
      setValue(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
