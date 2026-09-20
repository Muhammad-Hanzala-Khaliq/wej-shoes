"use client";

import Link from "next/link";
import Image from "next/image";
import ProductCard from "./ProductCard";
import { formatPrice } from "@/lib/utils";

function LoadingSkeleton({ viewMode }) {
  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-6 animate-pulse">
            <div className="w-40 h-40 md:w-56 md:h-56 bg-gray-200 rounded flex-shrink-0" />
            <div className="flex-1 py-4 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <svg
        className="w-16 h-16 mx-auto mb-4"
        style={{ color: "var(--text-muted)" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <p className="text-lg mb-1" style={{ color: "var(--text-secondary)" }}>No products found</p>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Try adjusting your filters</p>
    </div>
  );
}

function ProductListItem({ product }) {
  const images = product.images || [];
  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.regularPrice);
  const sizes = [...new Set((product.variants || []).map((v) => v.size))].sort(
    (a, b) => Number(a) - Number(b)
  );

  return (
    <Link href={`/product/${product.slug}`} className="group flex gap-6">
      <div
        className="w-40 h-40 md:w-56 md:h-56 flex-shrink-0 overflow-hidden"
        style={{ background: "var(--surface-soft)" }}
      >
        {primaryImage ? (
          <div className="relative w-full h-full">
            <Image
              src={primaryImage.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 160px, 224px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center py-2">
        {hasSale && (
          <span className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--brand)" }}>
            Sale
          </span>
        )}
        <h3 className="text-sm md:text-base font-medium mb-1 group-hover:underline" style={{ color: "var(--text-primary)" }}>
          {product.name}
        </h3>
        <div className="mb-2">
          {hasSale ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
                {formatPrice(product.regularPrice)}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {formatPrice(product.regularPrice)}
            </span>
          )}
        </div>
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => (
              <span
                key={size}
                className="text-xs px-2 py-0.5"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ProductGrid({ products = [], isLoading = false, viewMode = "grid" }) {
  if (isLoading) {
    return <LoadingSkeleton viewMode={viewMode} />;
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        {products.map((product) => (
          <ProductListItem key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} clean />
      ))}
    </div>
  );
}
