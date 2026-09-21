"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/features/cart/CartProvider";
import { flyToCart } from "@/lib/fly-to-cart";
import { formatPrice } from "@/lib/utils";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export default function QuickAddModal({ product, open, onClose, initialSize }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(initialSize || null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const addBtnRef = useRef(null);

  const images = product?.images || [];
  const variants = product?.variants || [];

  const sizes = [...new Set(variants.map((v) => v.size))].sort(
    (a, b) => Number(a) - Number(b)
  );

  const selectedVariant = selectedSize
    ? variants.find((v) => v.size === selectedSize && v.stockQuantity > 0)
    : null;

  const isSizeAvailable = (size) =>
    variants.some((v) => v.size === size && v.stockQuantity > 0);

  const resetState = useCallback(() => {
    setSelectedSize(initialSize || null);
    setQuantity(1);
    setAdding(false);
    setAdded(false);
    setImageIndex(0);
  }, [initialSize]);

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open, resetState]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function handleSizeSelect(size) {
    if (!isSizeAvailable(size)) return;
    setSelectedSize((prev) => (prev === size ? null : size));
  }

  function handleQuantityDelta(delta) {
    setQuantity((prev) => Math.max(1, prev + delta));
  }

  async function handleAddToCart() {
    if (!selectedVariant || adding) return;
    setAdding(true);

    const effectivePrice =
      hasSale ? Number(product.salePrice) : Number(product.regularPrice);

    // Fire all UI updates immediately — don't await
    flyToCart({ imageUrl: images[0]?.imageUrl, sourceEl: addBtnRef.current });
    addToCart(selectedVariant.id, quantity, {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: images[0]?.imageUrl,
      color: selectedVariant.color,
      size: selectedVariant.size,
      sku: selectedVariant.sku,
      stockQuantity: selectedVariant.stockQuantity,
      effectivePrice,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 250);
    setAdding(false);
  }

  async function handleBuyNow() {
    if (!selectedVariant || adding) return;
    setAdding(true);

    const effectivePrice =
      hasSale ? Number(product.salePrice) : Number(product.regularPrice);

    flyToCart({ imageUrl: images[0]?.imageUrl, sourceEl: addBtnRef.current });
    addToCart(selectedVariant.id, quantity, {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: images[0]?.imageUrl,
      color: selectedVariant.color,
      size: selectedVariant.size,
      sku: selectedVariant.sku,
      stockQuantity: selectedVariant.stockQuantity,
      effectivePrice,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
    });
    setAdded(true);
    setTimeout(() => {
      onClose();
      router.push("/checkout");
    }, 350);
    setAdding(false);
  }

  const hasSale =
    product?.salePrice && Number(product.salePrice) < Number(product.regularPrice);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick add to cart"
    >
      <div
        className="bg-white rounded-xl w-[92vw] max-w-md lg:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable content: column on mobile, row on lg */}
        <div className="overflow-y-auto flex flex-col lg:flex-row">
          {/* Image section */}
          <div className="relative w-full aspect-square max-h-[40vh] lg:max-h-[70vh] lg:w-1/2 shrink-0 bg-white">
            {images.length > 0 ? (
              <>
                <Image
                  src={getCloudinaryUrl(images[imageIndex].imageUrl, { width: 600, height: 600 })}
                  alt={`${product.name} ${imageIndex + 1}`}
                  fill
                  sizes="(max-width: 1024px) 92vw, 50vw"
                  className="object-cover"
                  loading="lazy"
                />

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors z-10"
                      aria-label="Previous image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors z-10"
                      aria-label="Next image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === imageIndex ? "bg-black w-4" : "bg-white/70 w-1.5"
                        }`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Details section */}
          <div className="p-4 lg:p-6 lg:w-1/2 flex flex-col relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-gray-100 transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Product name */}
            <h2 className="text-lg lg:text-xl font-semibold pr-8" style={{ color: "var(--text-primary)" }}>
              {product?.name}
            </h2>

            {/* Price */}
            <div className="mt-2 flex items-center gap-2">
              {hasSale ? (
                <>
                  <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-sm line-through" style={{ color: "var(--text-muted)" }}>
                    {formatPrice(product.regularPrice)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatPrice(product?.regularPrice)}
                </span>
              )}
            </div>

            {/* Size label */}
            <p className="mt-4 mb-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Shoe size
            </p>

            {/* Size pills */}
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const available = isSizeAvailable(size);
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    disabled={!available}
                    className="w-11 h-11 rounded-full border flex items-center justify-center text-sm transition-all"
                    style={{
                      borderColor: isSelected ? "var(--text-primary)" : "var(--border-strong)",
                      background: isSelected ? "var(--text-primary)" : "transparent",
                      color: !available
                        ? "var(--text-muted)"
                        : isSelected
                          ? "var(--bg)"
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

            {/* Quantity + Add to cart */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {/* Quantity stepper */}
                <div
                  className="flex items-center border rounded-lg overflow-hidden shrink-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    onClick={() => handleQuantityDelta(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-sm hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm font-medium border-x" style={{ borderColor: "var(--border)" }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityDelta(1)}
                    className="w-10 h-10 flex items-center justify-center text-sm hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to cart button */}
                <button
                  ref={addBtnRef}
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || adding}
                  className="flex-1 h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: added ? "var(--success)" : "var(--text-primary)",
                    color: "var(--bg)",
                  }}
                >
                  {added ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Added
                    </>
                  ) : adding ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to cart
                    </>
                  )}
                </button>
              </div>

              {/* Buy it now */}
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant || adding}
                className="w-full h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "var(--text-primary)",
                  color: "var(--bg)",
                }}
              >
                Buy it now
              </button>
            </div>

            {/* SKU + Stock */}
            <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
              SKU: {selectedVariant?.sku || "Select a size"}
            </p>
            {selectedVariant && (
              <p
                className="mt-1 text-xs font-medium"
                style={{
                  color: selectedVariant.stockQuantity > 0 ? "var(--success)" : "var(--danger)",
                }}
              >
                {selectedVariant.stockQuantity > 0 ? "In stock" : "Out of stock"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
