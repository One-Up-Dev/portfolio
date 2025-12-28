"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip if already tracked this path
    if (lastTrackedPath.current === pathname) {
      return;
    }

    // Don't track admin pages
    if (pathname?.startsWith("/admin")) {
      return;
    }

    // Track the page view
    const trackPageView = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pagePath: pathname,
            referrer: document.referrer || null,
          }),
        });
        lastTrackedPath.current = pathname;
      } catch (error) {
        // Silently fail - analytics shouldn't break the site
        console.debug("Failed to track page view:", error);
      }
    };

    trackPageView();
  }, [pathname]);

  return null;
}
