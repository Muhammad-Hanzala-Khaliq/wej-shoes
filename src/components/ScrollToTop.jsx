"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolls to top on route change.
 * Skips scroll if the URL contains a hash anchor (e.g., #section).
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip if URL has a hash — user likely wants to stay at anchor
    if (typeof window !== "undefined" && window.location.hash) return;

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
