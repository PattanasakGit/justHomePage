"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe `matchMedia` subscription. Returns `false` on the server so the
 * first client render matches the server HTML; the post-mount effect
 * subscribes for live updates.
 */
export function useMediaQuery(query: string): boolean {
  const getInitial = () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getInitial);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
