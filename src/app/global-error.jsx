"use client";

import { useEffect } from "react";
import { logError } from "@/lib/logger";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    logError("global-error", error, { path: typeof window !== "undefined" ? window.location.pathname : "unknown" });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Something went wrong</h1>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              A critical error occurred. Please reload the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
