"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logError } from "@/lib/logger";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    logError("admin-error-boundary", error, { path: typeof window !== "undefined" ? window.location.pathname : "unknown" });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full text-center">
        <h1 className="heading-lg mb-4">Something went wrong</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          An error occurred in the admin panel. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">
            Try Again
          </button>
          <Link href="/admin/dashboard" className="btn btn-outline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
