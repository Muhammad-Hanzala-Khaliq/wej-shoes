"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "wej_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — show banner as fallback
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4"
    >
      <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          We use essential cookies to keep your cart and session working. No
          tracking cookies are used.
          <Link href="/privacy-policy" className="underline ml-1">
            Learn more
          </Link>
        </p>
        <button onClick={accept} className="btn btn-primary btn-sm whitespace-nowrap">
          Got it
        </button>
      </div>
    </div>
  );
}
