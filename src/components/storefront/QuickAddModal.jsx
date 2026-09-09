"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/CartProvider";
import { flyToCart } from "@/lib/fly-to-cart";

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

export default function QuickAddModal({ product, open, onClose, initialSize }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(initialSize || null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
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
    >
      <div
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden grid md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: images */}
        <div className="overflow-y-auto max-h-[90vh] bg-white">
          {images.length > 0 ? (
            images.map((img, i) => (
              <img
                key={img.id || i}
                src={img.imageUrl}
                alt={`${product.name} ${i + 1}`}
                className="w-full object-cover"
              />
            ))
          ) : (
            <div className="w-full aspect-square flex items-center justify-center bg-gray-100 text-gray-400">
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

        {/* Right: info panel */}
        <div className="p-6 md:p-8 overflow-y-auto relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Product name */}
          <h2 className="text-xl font-semibold pr-8" style={{ color: "var(--text-primary)" }}>
            {product?.name}
          </h2>

          {/* Price */}
          <div className="mt-3 flex items-center gap-2">
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
          <p className="mt-5 mb-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
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
                  className="w-12 h-12 rounded-full border flex items-center justify-center text-sm transition-all"
                  style={{
                    borderColor: isSelected ? "var(--text-primary)" : "var(--border-strong)",
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

          {/* Quantity + Add to cart row */}
          <div className="mt-5 flex items-center gap-3">
            {/* Quantity stepper */}
            <div
              className="flex items-center border rounded-lg overflow-hidden"
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
                color: "#fff",
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
            className="mt-3 w-full h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--text-primary)",
              color: "#fff",
            }}
          >
            Buy it now
          </button>

          {/* SKU */}
          <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
            SKU: {selectedVariant?.sku || "Select a size"}
          </p>

          {/* Stock */}
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
  );
}
