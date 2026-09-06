"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/features/cart/CartProvider";

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const images = product.images || [];
  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.regularPrice);

  const [imageIndex, setImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const sizes = [...new Set((product.variants || []).map((v) => v.size))].sort(
    (a, b) => Number(a) - Number(b)
  );

  function isSizeAvailable(size) {
    return (product.variants || []).some(
      (v) => v.size === size && v.stockQuantity > 0
    );
  }

  function getVariantForSize(size) {
    return (product.variants || []).find(
      (v) => v.size === size && v.stockQuantity > 0
    );
  }

  function handleMouseEnter() {
    if (images.length > 1) {
      setImageIndex(1);
    }
  }

  function handleMouseLeave() {
    setImageIndex(0);
  }

  function handlePrevImage(e) {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function handleNextImage(e) {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function handleSizeSelect(e, size) {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg("");
    setSelectedSize((prev) => (prev === size ? null : size));
  }

  async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg("");

    if (!selectedSize) {
      setErrorMsg("Select a size");
      return;
    }

    const variant = getVariantForSize(selectedSize);
    if (!variant) {
      setErrorMsg("Size unavailable");
      return;
    }

    const result = await addToCart(variant.id, 1);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } else {
      setErrorMsg(result.error || "Failed to add");
    }
  }

  const currentImage = images[imageIndex] || primaryImage;

  return (
    <div
      className="group block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card card-hover overflow-hidden">
        {/* Image area */}
        <div
          className="aspect-square relative overflow-hidden"
          style={{ background: "#f2f2f2" }}
        >
          {currentImage ? (
            <img
              src={currentImage.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* SALE badge */}
          {hasSale && (
            <span className="badge badge-danger absolute top-2 left-2 z-10">
              SALE
            </span>
          )}

          {/* Left arrow */}
          {images.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity z-10"
              style={{
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" style={{ color: "var(--text-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {images.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity z-10"
              style={{
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
              aria-label="Next image"
            >
              <svg className="w-4 h-4" style={{ color: "var(--text-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-all z-10"
            style={{
              background: added ? "var(--success)" : "rgba(255,255,255,0.95)",
              boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
            }}
            aria-label="Add to cart"
          >
            {added ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" style={{ color: "var(--text-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            )}
          </button>
        </div>

        {/* Info area */}
        <div className="p-3">
          <Link href={`/product/${product.slug}`} className="block">
            <h3
              className="text-sm font-medium truncate hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              {product.name}
            </h3>
          </Link>

          <div className="mt-1.5">
            {hasSale ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: "var(--brand)" }}>
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
                  {formatPrice(product.regularPrice)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {/* Size pills */}
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity">
              {sizes.map((size) => {
                const available = isSizeAvailable(size);
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={(e) => handleSizeSelect(e, size)}
                    disabled={!available}
                    className="text-xs rounded-full px-2.5 py-1 transition-colors"
                    style={{
                      border: `1px solid ${isSelected ? "var(--text-primary)" : "var(--border-strong)"}`,
                      background: isSelected ? "var(--text-primary)" : "transparent",
                      color: !available
                        ? "var(--text-muted)"
                        : isSelected
                          ? "#fff"
                          : "var(--text-primary)",
                      textDecoration: !available ? "line-through" : "none",
                      cursor: available ? "pointer" : "not-allowed",
                      opacity: !available ? 0.5 : 1,
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <p className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
