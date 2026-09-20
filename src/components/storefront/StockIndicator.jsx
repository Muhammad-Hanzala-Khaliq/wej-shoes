"use client";

import { useState, useEffect, useRef } from "react";

// Module-level cache (survives remounts, prevents undefined issues)
const stockCache = new Map(); // variantId -> { stock: number, timestamp: number }
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default function StockIndicator({ variantId, initialStock }) {
  const [stock, setStock] = useState(initialStock);
  const abortRef = useRef(null);

  useEffect(() => {
    // 1. Guard against missing variantId
    if (!variantId) return;

    // 2. Show initialStock immediately (no layout shift)
    setStock(initialStock);

    // 3. Check cache (5 min TTL)
    const cached = stockCache.get(variantId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setStock(cached.stock);
      return;
    }

    // 4. Cancel previous request if variant changed rapidly
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    // 5. Fetch fresh stock
    async function fetchStock() {
      try {
        const res = await fetch(`/api/checkout/variant/${variantId}`, {
          signal: controller.signal,
        });

        // API returns 400 for out-of-stock variants — treat as stock=0
        if (res.status === 400) {
          const errData = await res.json().catch(() => ({}));
          if (errData.error === "Variant out of stock") {
            setStock(0);
            stockCache.set(variantId, { stock: 0, timestamp: Date.now() });
            return;
          }
        }

        if (!res.ok) return; // keep initialStock on other errors

        const data = await res.json();
        if (typeof data.stockQuantity === "number") {
          setStock(data.stockQuantity);
          stockCache.set(variantId, { stock: data.stockQuantity, timestamp: Date.now() });
        }
      } catch (err) {
        // Graceful: keep last known stock on abort or network error
        if (err.name !== "AbortError") {
          console.warn("StockIndicator: fetch failed, keeping initialStock");
        }
      }
    }

    fetchStock();

    // Cleanup on unmount or variantId change
    return () => {
      controller.abort();
    };
  }, [variantId, initialStock]); // initialStock included so cache-first render stays correct

  // 6. Render — same UI as old static stock line
  if (stock === 0) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
        <span style={{ color: "var(--danger)" }}>Out of stock</span>
      </div>
    );
  }

  if (stock <= 5) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
        <span style={{ color: "var(--warning)" }}>Only {stock} left</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
      <span style={{ color: "var(--text-muted)" }}>In stock</span>
    </div>
  );
}
