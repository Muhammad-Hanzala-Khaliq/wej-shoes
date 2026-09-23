"use client";

import { useState, useRef } from "react";
import { useCart } from "@/features/cart/CartProvider";
import { flyToCart } from "@/lib/fly-to-cart";

export default function AddToCartButton({
  variant,
  product,
  disabled,
  quantity: quantityProp,
  setQuantity: setQuantityProp,
}) {
  const [internalQuantity, setInternalQuantity] = useState(1);
  // Controlled mode: ProductInfoPanel lifts this state so the same quantity
  // can be passed to Buy Now / checkout. Falls back to internal state otherwise.
  const quantity = quantityProp ?? internalQuantity;
  const setQuantity = setQuantityProp ?? setInternalQuantity;
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [quantityError, setQuantityError] = useState("");
  const { addToCart } = useCart();
  const btnRef = useRef(null);

  const maxStock = variant ? variant.stockQuantity : 0;
  const isDisabled = disabled || !variant || variant.stockQuantity === 0;
  const isAddDisabled = isDisabled || isAdding;

  const handleDecrease = () => {
    setQuantityError("");
    if (!isAdding && quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantityError("");
    if (isAdding) return;

    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    } else {
      setQuantityError(`Maximum quantity available is ${maxStock}`);
    }
  };

  const handleAddToCart = async () => {
    if (isAddDisabled) return;

    setQuantityError("");
    setIsAdding(true);

    const hasSale =
      product?.salePrice && Number(product.salePrice) < Number(product.regularPrice);
    const effectivePrice = hasSale
      ? Number(product.salePrice)
      : Number(product.regularPrice);

    try {
      flyToCart({ imageUrl: product.images?.[0]?.imageUrl, sourceEl: btnRef.current });

      const result = await addToCart(variant.id, quantity, {
        productId: product.id,
        productName: product.name,
        slug: product.slug,
        image: product.images?.[0]?.imageUrl,
        color: variant.color,
        size: variant.size,
        sku: variant.sku,
        stockQuantity: variant.stockQuantity,
        effectivePrice,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
      });

      if (result?.success) {
        setAdded(true);
        setTimeout(() => {
          setAdded(false);
          setQuantity(1);
        }, 2000);
      } else if (result?.error) {
        setQuantityError(result.error);
      }
    } catch {
      setQuantityError("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity stepper + Add to cart button */}
      {variant && variant.stockQuantity > 0 && (
        <div className="flex items-center gap-3">
          {/* Quantity stepper - pill */}
          <div
            className="flex items-center rounded-full"
            style={{
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
            }}
          >
            <button
              onClick={handleDecrease}
              disabled={quantity <= 1 || isAdding}
              className="w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: "var(--text-primary)" }}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span
              className="w-10 h-10 flex items-center justify-center text-sm font-medium border-x"
              style={{
                color: "var(--text-primary)",
                borderColor: "var(--border-strong)",
              }}
            >
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={quantity >= maxStock || isAdding}
              className="w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: "var(--text-primary)" }}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to cart - black pill */}
          <button
            ref={btnRef}
            onClick={handleAddToCart}
            disabled={isAddDisabled}
            className="flex-1 h-10 rounded-full font-semibold text-sm transition-colors"
            style={{
              background: added
                ? "var(--success)"
                : isAddDisabled
                  ? "var(--border)"
                  : "var(--ink)",
              color: "#fff",
              cursor: isAddDisabled ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isAddDisabled && !added) e.target.style.background = "var(--ink-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isAddDisabled && !added) e.target.style.background = "var(--ink)";
            }}
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Adding...
              </span>
            ) : added ? (
              "Added ✓"
            ) : (
              "Add to cart"
            )}
          </button>
        </div>
      )}

      {/* Out of stock state */}
      {variant && variant.stockQuantity === 0 && (
        <div
          className="h-10 rounded-full flex items-center justify-center font-semibold text-sm"
          style={{ background: "var(--border)", color: "var(--text-muted)" }}
        >
          Out of stock
        </div>
      )}

      {/* No variant selected - full width button disabled */}
      {!variant && (
        <div
          className="h-10 rounded-full flex items-center justify-center font-semibold text-sm"
          style={{ background: "var(--border)", color: "var(--text-muted)" }}
        >
          Add to cart
        </div>
      )}

      {/* Error text */}
      {quantityError && (
        <p className="text-xs" style={{ color: "var(--danger)" }}>
          {quantityError}
        </p>
      )}
    </div>
  );
}
