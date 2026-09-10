"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AddToCartButton from "@/components/storefront/AddToCartButton";
import { addRecentlyViewed } from "@/lib/recently-viewed";

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

export default function ProductInfoPanel({ product, variants, initialVariantId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wishlist, setWishlist] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Helper: find first in-stock variant
  const findFirstInStock = () => {
    return variants.find((v) => v.stockQuantity > 0 && v.status === "ACTIVE") || variants[0];
  };

  // Initialize selectedVariant
  const [selectedVariant, setSelectedVariant] = useState(() => {
    // Priority 1: variant ID from URL prop (passed from server component)
    if (initialVariantId) {
      const urlVariant = variants.find((v) => v.id === initialVariantId);
      if (urlVariant) return urlVariant;
    }

    // Priority 2: variant ID from current URL (if page loaded directly)
    const urlVariantId = searchParams.get("variant");
    if (urlVariantId) {
      const urlVariant = variants.find((v) => v.id === urlVariantId);
      if (urlVariant) return urlVariant;
    }

    // Priority 3: first in-stock variant (Daisy behavior)
    return findFirstInStock();
  });

  // Update URL when variant changes OR on initial load
  useEffect(() => {
    if (!selectedVariant) return;

    const currentVariantId = searchParams.get("variant");

    // Only update if variant ID is missing or different
    if (currentVariantId !== selectedVariant.id) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant", selectedVariant.id);

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedVariant, searchParams, router]);

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

  // Handle size selection
  const handleSizeSelect = (size) => {
    const variant = variants.find((v) => String(v.size) === String(size));
    if (variant && variant.stockQuantity > 0) {
      setSelectedVariant(variant);
    }
  };

  // Handle Buy Now - redirect to checkout without adding to cart
  const handleBuyNow = () => {
    if (!selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow) return;

    setIsBuyingNow(true);
    router.push(`/checkout?variant=${selectedVariant.id}&quantity=1&buyNow=true`);
  };

  // Get unique sizes from variants
  const sizes = [...new Set(variants.map((v) => String(v.size)))];

  // Check if a size is available
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
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000" stroke="#000000" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
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
                  background: selected ? "#000000" : "#f2f2f2",
                  color: selected ? "#ffffff" : "var(--text-primary)",
                  border: selected ? "2px solid #000000" : "2px solid transparent",
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
        <div className="text-sm" style={{ color: selectedVariant.stockQuantity > 0 ? "var(--text-muted)" : "var(--danger)" }}>
          {selectedVariant.stockQuantity > 0 ? "In stock" : "Out of stock"}
        </div>
      )}

      {/* Add to cart */}
      <AddToCartButton
        variant={selectedVariant}
        product={product}
        disabled={!selectedVariant}
      />

      {/* Buy it now */}
      <button
        onClick={handleBuyNow}
        disabled={!selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow}
        className="w-full h-10 rounded-full font-semibold text-sm transition-colors"
        style={{
          background: !selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow
            ? "#e5e5e5"
            : "#ffffff",
          color: !selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow
            ? "#a3a3a3"
            : "#000000",
          border: "1px solid #000000",
          cursor: !selectedVariant || selectedVariant.stockQuantity === 0 || isBuyingNow
            ? "not-allowed"
            : "pointer",
        }}
        onMouseEnter={(e) => {
          if (selectedVariant && selectedVariant.stockQuantity > 0 && !isBuyingNow) {
            e.target.style.background = "#000000";
            e.target.style.color = "#ffffff";
          }
        }}
        onMouseLeave={(e) => {
          if (selectedVariant && selectedVariant.stockQuantity > 0 && !isBuyingNow) {
            e.target.style.background = "#ffffff";
            e.target.style.color = "#000000";
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
        >
          <div
            className="relative bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-100"
              aria-label="Close size chart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Size Chart Image */}
            <img
              src="/size-chart.png"
              alt="Size Chart - Women Shoes"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
