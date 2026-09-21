"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import AddToCartButton from "@/components/storefront/AddToCartButton";
import StockIndicator from "@/components/storefront/StockIndicator";
import { addRecentlyViewed } from "@/lib/recently-viewed";
import { formatPrice } from "@/lib/utils";

export default function ProductInfoPanel({ product, variants, initialVariant, allOutOfStock }) {
  const searchParams = useSearchParams();
  const [wishlist, setWishlist] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Determine initial variant: URL param > server prop > first in-stock > first
  const resolveInitialVariant = () => {
    const urlVariantId = searchParams.get("variant");
    if (urlVariantId) {
      const found = variants.find((v) => v.id === urlVariantId);
      if (found) return found;
    }
    if (initialVariant) return initialVariant;
    return variants.find((v) => v.stockQuantity > 0 && v.status === "ACTIVE") || variants[0];
  };

  const [selectedVariant, setSelectedVariant] = useState(resolveInitialVariant);

  // Auto-switch: if selected variant is OOS and in-stock variants exist, switch to first in-stock
  useEffect(() => {
    if (selectedVariant && selectedVariant.stockQuantity === 0 && !allOutOfStock) {
      const firstInStock = variants.find((v) => v.stockQuantity > 0 && v.status === "ACTIVE");
      if (firstInStock && firstInStock.id !== selectedVariant.id) {
        setSelectedVariant(firstInStock);
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?variant=${firstInStock.id}`
        );
      }
    }
  }, [selectedVariant, variants, allOutOfStock]);

  // Sync variant from URL when searchParams change (e.g., browser back/forward)
  useEffect(() => {
    const urlVariantId = searchParams.get("variant");
    if (urlVariantId) {
      const variant = variants.find((v) => v.id === urlVariantId);
      if (variant && variant.id !== selectedVariant?.id) {
        setSelectedVariant(variant);
      }
    }
  }, [searchParams, variants, selectedVariant?.id]);

  // Ensure URL has variant param on mount
  useEffect(() => {
    if (!selectedVariant) return;
    if (!window.location.search.includes("variant=")) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?variant=${selectedVariant.id}`
      );
    }
  }, [selectedVariant]);

  // Track recently viewed
  useEffect(() => {
    addRecentlyViewed({
      slug: product.slug,
      name: product.name,
      imageUrl: product.images?.[0]?.imageUrl,
      regularPrice: Number(product.regularPrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
    });
  }, [product.slug]);

  // Handle size selection — update state + URL
  const handleSizeSelect = (size) => {
    const variant = variants.find((v) => String(v.size) === String(size));
    if (variant && variant.stockQuantity > 0) {
      setSelectedVariant(variant);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?variant=${variant.id}`
      );
    }
  };

  // Handle Buy Now
  const handleBuyNow = () => {
    if (!selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow) return;
    setIsBuyingNow(true);
    window.location.href = `/checkout?variant=${selectedVariant.id}&quantity=1&buyNow=true`;
  };

  const sizes = [...new Set(variants.map((v) => String(v.size)))];

  const isSizeAvailable = (size) => {
    const variant = variants.find((v) => String(v.size) === String(size));
    return variant && variant.stockQuantity > 0 && variant.status === "ACTIVE";
  };

  const regularPrice = Number(product.regularPrice);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const hasSale = salePrice && salePrice < regularPrice;

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <div className="space-y-6">
      {/* Product name + wishlist */}
      <div className="flex items-start justify-between gap-4">
        <h1
          className="text-xl md:text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {product.name}
        </h1>
        <button
          onClick={() => setWishlist(!wishlist)}
          className="flex-shrink-0 p-1 transition-colors"
          aria-label="Add to wishlist"
        >
          {wishlist ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="var(--ink)" stroke="var(--ink)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Category */}
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {product.category?.name}
      </p>

      {/* Price */}
      <div className="flex items-center gap-3">
        {hasSale ? (
          <>
            <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {formatPrice(salePrice)}
            </span>
            <span className="text-sm line-through" style={{ color: "var(--text-muted)" }}>
              {formatPrice(regularPrice)}
            </span>
          </>
        ) : (
          <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {formatPrice(regularPrice)}
          </span>
        )}
      </div>

      {/* Out of stock banner */}
      {allOutOfStock && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background: "var(--surface-soft)", color: "var(--text-muted)" }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          This product is currently out of stock
        </div>
      )}

      {/* Size Chart button */}
      <div>
        <button
          onClick={() => setShowSizeChart(true)}
          className="text-sm underline transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          Size chart
        </button>
      </div>

      {/* Size selector */}
      <div>
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
          {selectedVariant ? `Size: ${selectedVariant.size}` : "Shoe size"}
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const available = isSizeAvailable(size);
            const selected = selectedVariant && String(selectedVariant.size) === size;

            return (
              <button
                key={size}
                onClick={() => handleSizeSelect(size)}
                disabled={!available}
                className="flex items-center justify-center w-14 h-14 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: selected ? "var(--ink)" : "var(--surface-soft)",
                  color: selected ? "var(--bg)" : "var(--text-primary)",
                  border: selected ? "2px solid var(--ink)" : "2px solid transparent",
                  opacity: available ? 1 : 0.4,
                  textDecoration: available ? "none" : "line-through",
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock indicator */}
      {selectedVariant && (
        <StockIndicator
          variantId={selectedVariant.id}
          initialStock={selectedVariant.stockQuantity}
        />
      )}

      {/* Add to cart */}
      <AddToCartButton
        variant={selectedVariant}
        product={product}
        disabled={!selectedVariant || allOutOfStock}
      />

      {/* Buy it now */}
      <button
        onClick={handleBuyNow}
        disabled={!selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow || allOutOfStock}
        className="w-full h-10 rounded-full font-semibold text-sm transition-colors"
        style={{
          background: !selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow || allOutOfStock
            ? "var(--border)"
            : "var(--bg)",
          color: !selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow || allOutOfStock
            ? "var(--text-muted)"
            : "var(--ink)",
          border: "1px solid var(--ink)",
          cursor: !selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow || allOutOfStock
            ? "not-allowed"
            : "pointer",
        }}
        onMouseEnter={(e) => {
          if (selectedVariant && selectedVariant.stockQuantity > 0 && !isBuyingNow && !allOutOfStock) {
            e.target.style.background = "var(--ink)";
            e.target.style.color = "var(--bg)";
          }
        }}
        onMouseLeave={(e) => {
          if (selectedVariant && selectedVariant.stockQuantity > 0 && !isBuyingNow && !allOutOfStock) {
            e.target.style.background = "var(--bg)";
            e.target.style.color = "var(--ink)";
          }
        }}
      >
        {isBuyingNow ? "Redirecting..." : "Buy it now"}
      </button>

      {/* Accordion */}
      <div className="mt-4" style={{ borderTop: "1px solid var(--border)" }}>
        {/* Product Details */}
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => toggleAccordion("details")}
            className="flex items-center justify-between w-full py-4 text-left"
            aria-expanded={openAccordion === "details"}
          >
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Product Details
            </span>
            <svg
              className="w-4 h-4 transition-transform duration-200"
              style={{
                color: "var(--text-muted)",
                transform: openAccordion === "details" ? "rotate(180deg)" : "rotate(0deg)",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openAccordion === "details" && (
            <div className="pb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              {product.description || "No additional details available."}
            </div>
          )}
        </div>

        {/* Shipping & Returns */}
        <div>
          <button
            onClick={() => toggleAccordion("shipping")}
            className="flex items-center justify-between w-full py-4 text-left"
            aria-expanded={openAccordion === "shipping"}
          >
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Shipping & Returns
            </span>
            <svg
              className="w-4 h-4 transition-transform duration-200"
              style={{
                color: "var(--text-muted)",
                transform: openAccordion === "shipping" ? "rotate(180deg)" : "rotate(0deg)",
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openAccordion === "shipping" && (
            <div className="pb-4 text-sm space-y-2" style={{ color: "var(--text-secondary)" }}>
              <div className="flex items-start gap-2">
                <span>•</span>
                <span>Delivery in 3-5 business days</span>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <span>Cash on Delivery available</span>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <span>7-day easy returns</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={() => setShowSizeChart(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Size chart"
        >
          <div
            className="relative bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-100"
              aria-label="Close size chart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-full aspect-[4/3]">
              <Image
                src="/size-chart.png"
                alt="Shoe size chart showing measurements in centimeters and corresponding sizes"
                fill
                sizes="(max-width: 640px) 100vw, 512px"
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
