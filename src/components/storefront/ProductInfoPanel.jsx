"use client";

import { useState, useEffect } from "react";
import VariantSelector from "@/components/storefront/VariantSelector";
import AddToCartButton from "@/components/storefront/AddToCartButton";
import { addRecentlyViewed } from "@/lib/recently-viewed";

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

export default function ProductInfoPanel({ product, variants }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  useEffect(() => {
    addRecentlyViewed({
      slug: product.slug,
      name: product.name,
      imageUrl: product.images?.[0]?.imageUrl,
      regularPrice: Number(product.regularPrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
    });
  }, [product.slug]);

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
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1a1714" stroke="#1a1714" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#1a1714" strokeWidth="2">
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

      {/* Variant selector */}
      <VariantSelector
        variants={variants}
        selectedVariant={selectedVariant}
        onSelectVariant={setSelectedVariant}
      />

      {/* Add to cart */}
      <AddToCartButton
        variant={selectedVariant}
        product={product}
        disabled={!selectedVariant}
      />

      {/* Size Guide link */}
      <div className="flex justify-end">
        <button
          className="text-xs underline transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onClick={() => {}}
        >
          Size Guide
        </button>
      </div>

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
    </div>
  );
}
