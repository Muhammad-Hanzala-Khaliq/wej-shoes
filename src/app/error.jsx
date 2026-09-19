"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logError } from "@/lib/logger";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    logError("error-boundary", error, { path: window.location.pathname });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--surface-soft)" }}>
      <div className="card p-8 max-w-md w-full text-center">
        <h1 className="heading-lg mb-4">Something went wrong</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">
            Try Again
          </button>
          <Link href="/" className="btn btn-outline">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
