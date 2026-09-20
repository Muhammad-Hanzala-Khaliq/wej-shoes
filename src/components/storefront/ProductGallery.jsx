"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary";

// Preload helper — triggers browser preload for next/prev images
function preloadImage(src) {
  if (!src) return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
}

export default function ProductGallery({ images = [], productName }) {
  const [selectedIndex, setSelectedIndex] = useState(
    images.findIndex((img) => img.isPrimary) >= 0
      ? images.findIndex((img) => img.isPrimary)
      : 0
  );

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mainImageRef = useRef(null);

  // Get the current image URL (optimized)
  const getImageUrl = useCallback(
    (index, size = "large") => {
      const img = images[index];
      if (!img) return "";
      const dims = size === "thumb" ? { width: 200, height: 200 } : { width: 800, height: 800 };
      return getCloudinaryUrl(img.imageUrl || img.url, dims);
    },
    [images]
  );

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipe = 50;

    if (Math.abs(deltaX) < minSwipe) return;

    if (deltaX > 0 && selectedIndex < images.length - 1) {
      // Swiped left → next image
      setSelectedIndex((prev) => prev + 1);
    } else if (deltaX < 0 && selectedIndex > 0) {
      // Swiped right → prev image
      setSelectedIndex((prev) => prev - 1);
    }
  }, [selectedIndex, images.length]);

  // Thumbnail click handler
  const handleThumbnailClick = useCallback(
    (index) => {
      setSelectedIndex(index);
      // Prefetch adjacent images
      if (index > 0) preloadImage(getImageUrl(index - 1, "large"));
      if (index < images.length - 1) preloadImage(getImageUrl(index + 1, "large"));
    },
    [getImageUrl, images.length]
  );

  if (images.length === 0) {
    return (
      <div
        className="aspect-square flex items-center justify-center"
        style={{ background: "var(--surface-soft)", borderRadius: "var(--radius-lg)" }}
      >
        <svg className="w-24 h-24" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop: Main image + thumbnail strip (hidden on mobile) */}
      <div className="hidden md:block">
        {/* Main image */}
        <div
          className="relative aspect-square overflow-hidden"
          style={{ borderRadius: "var(--radius-lg)", background: "var(--surface-soft)" }}
        >
          <Image
            key={selectedIndex}
            src={getImageUrl(selectedIndex, "large")}
            alt={images[selectedIndex]?.altText || productName || "Product image"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-200"
            priority={selectedIndex === 0}
          />
        </div>

        {/* Thumbnail strip below */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200"
                style={{
                  border: selectedIndex === index
                    ? "2px solid var(--ink)"
                    : "2px solid transparent",
                  opacity: selectedIndex === index ? 1 : 0.6,
                }}
                onMouseEnter={() => {
                  // Prefetch on hover
                  if (index !== selectedIndex) preloadImage(getImageUrl(index, "large"));
                }}
              >
                <Image
                  src={getImageUrl(index, "thumb")}
                  alt={img.altText || `${productName} ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                {/* Primary badge on first image */}
                {img.isPrimary && index === 0 && (
                  <span
                    className="absolute top-0.5 left-0.5 px-1 text-[10px] font-medium rounded"
                    style={{
                      background: "var(--ink)",
                      color: "var(--bg)",
                    }}
                  >
                    ★
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: Swipeable image + dots (hidden on desktop) */}
      <div className="md:hidden">
        <div
          ref={mainImageRef}
          className="relative aspect-square overflow-hidden select-none"
          style={{ borderRadius: "var(--radius-lg)", background: "var(--surface-soft)" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            key={selectedIndex}
            src={getImageUrl(selectedIndex, "large")}
            alt={images[selectedIndex]?.altText || productName || "Product image"}
            fill
            sizes="100vw"
            className="object-cover transition-opacity duration-200"
            priority={selectedIndex === 0}
          />

          {/* Swipe hint on first image */}
          {images.length > 1 && selectedIndex === 0 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium pointer-events-none"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                color: "white",
              }}
            >
              ← Swipe →
            </div>
          )}
        </div>

        {/* Dots — single source of truth: selectedIndex */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className="transition-all duration-200"
                style={{
                  width: selectedIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: selectedIndex === index ? "var(--ink)" : "var(--border)",
                }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
