"use client";

import { useState, useRef, useCallback, useEffect } from "react";

function getOptimizedUrl(url, width) {
  if (!url || !url.includes("cloudinary")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}

export default function ProductGallery({ images = [], productName }) {
  const [selectedIndex, setSelectedIndex] = useState(
    images.findIndex((img) => img.isPrimary) >= 0
      ? images.findIndex((img) => img.isPrimary)
      : 0
  );
  const carouselRef = useRef(null);

  const scrollToIndex = useCallback(
    (index) => {
      if (!carouselRef.current) return;
      const container = carouselRef.current;
      const child = container.children[index];
      if (child) {
        const scrollLeft = child.offsetLeft - container.offsetLeft;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    },
    []
  );

  const handleDotClick = (index) => {
    setSelectedIndex(index);
    scrollToIndex(index);
  };

  if (images.length === 0) {
    return (
      <div
        className="aspect-square flex items-center justify-center"
        style={{ background: "#f2f2f2", borderRadius: "var(--radius-lg)" }}
      >
        <svg className="w-24 h-24" style={{ color: "#ccc" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop: 2-column grid */}
      <div className="hidden md:grid grid-cols-2 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square overflow-hidden cursor-pointer"
            style={{ background: "#f2f2f2" }}
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={getOptimizedUrl(image.imageUrl, 600)}
              alt={image.altText || `${productName} ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index > 1 ? "lazy" : "eager"}
            />
          </div>
        ))}
      </div>

      {/* Mobile: single image carousel */}
      <div className="md:hidden">
        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full snap-center"
            >
              <div
                className="aspect-square overflow-hidden"
                style={{ background: "#f2f2f2" }}
              >
                <img
                  src={getOptimizedUrl(image.imageUrl, 800)}
                  alt={image.altText || `${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dot pagination */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className="w-2 h-2 rounded-full transition-all duration-200"
                style={{
                  background: index === selectedIndex ? "#000000" : "#d1d5db",
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
