"use client";

import { useRef } from "react";
import Link from "next/link";

export default function CategoryCarousel({ categories }) {
  const scrollRef = useRef(null);

  function scroll(direction) {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }
  if (!categories || categories.length === 0) return null;

  return (
    <div className="relative">
      {/* Desktop arrows */}
      <button
        onClick={() => scroll("left")}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full items-center justify-center transition-opacity hover:opacity-100 opacity-70"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
        aria-label="Scroll left"
      >
        <svg className="w-5 h-5" style={{ color: "var(--text-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full items-center justify-center transition-opacity hover:opacity-100 opacity-70"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
        aria-label="Scroll right"
      >
        <svg className="w-5 h-5" style={{ color: "var(--text-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/collections/${category.slug}`}
            className="flex flex-col items-center gap-3 flex-shrink-0 group"
          >
            <div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105"
              style={{ background: "var(--surface-soft)" }}
            >
              {category.displayImage ? (
                <img
                  src={category.displayImage}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className="text-3xl md:text-4xl font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {category.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span
              className="text-sm font-medium group-hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
