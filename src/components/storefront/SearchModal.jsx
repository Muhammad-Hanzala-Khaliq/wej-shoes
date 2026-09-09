"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getRecentlyViewed, clearRecentlyViewed } from "@/lib/recently-viewed";

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

export default function SearchModal({ open, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (open) {
      setRecentlyViewed(getRecentlyViewed());
      setQuery("");
      setResults([]);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (query.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (res.ok) setResults(data.products || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleClearRecent = useCallback(() => {
    clearRecentlyViewed();
    setRecentlyViewed([]);
  }, []);

  const handleNavigate = useCallback(
    (slug) => {
      router.push(`/product/${slug}`);
      onClose();
    },
    [router, onClose]
  );

  if (!open) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[8vh]"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: "var(--text-primary)" }}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            aria-label="Close search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="max-h-[60vh] overflow-y-auto px-5 pb-6">
          {!hasQuery ? (
            <>
              {recentlyViewed.length > 0 ? (
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Recently viewed
                    </h3>
                    <button
                      onClick={handleClearRecent}
                      className="text-sm transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recentlyViewed.map((item) => (
                      <button
                        key={item.slug}
                        onClick={() => handleNavigate(item.slug)}
                        className="text-left group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden" style={{ background: "var(--surface-soft)" }}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm mt-2 line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.salePrice && item.salePrice < item.regularPrice ? (
                            <>
                              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                                {formatPrice(item.salePrice)}
                              </span>
                              <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
                                {formatPrice(item.regularPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                              {formatPrice(item.regularPrice)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-8 text-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Search for shoes, sneakers, heels...
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--text-primary)" }} />
                </div>
              ) : results.length > 0 ? (
                <div className="pt-4">
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                    Products
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {results.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.slug)}
                        className="text-left group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden" style={{ background: "var(--surface-soft)" }}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm mt-2 line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.salePrice && item.salePrice < item.regularPrice ? (
                            <>
                              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                                {formatPrice(item.salePrice)}
                              </span>
                              <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
                                {formatPrice(item.regularPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                              {formatPrice(item.regularPrice)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-8 text-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No products found for &quot;{query}&quot;
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
