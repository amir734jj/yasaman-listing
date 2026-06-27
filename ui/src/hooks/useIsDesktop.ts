import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport is at least `minWidth` wide (desktop). Used to serve the heavier
 * OpenStreetMap tile view on desktop while keeping a lightweight, data-saving fallback on mobile.
 */
export function useIsDesktop(minWidth = 768): boolean {
  const query = `(min-width: ${minWidth}px)`;
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return isDesktop;
}
