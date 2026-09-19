"use client";

import { useState, useRef } from "react";
import { useCart } from "@/features/cart/CartProvider";
import { flyToCart } from "@/lib/fly-to-cart";

export default function AddToCartButton({ variant, product, disabled }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [quantityError, setQuantityError] = useState("");
  const { addToCart } = useCart();
  const btnRef = useRef(null);

  const maxStock = variant ? variant.stockQuantity : 0;
  const isDisabled = disabled || !variant || variant.stockQuantity === 0;

  const handleDecrease = () => {
    setQuantityError("");
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantityError("");
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    } else {
      setQuantityError(`Maximum quantity available is ${maxStock}`);
    }
  };

  const handleAddToCart = async () => {
    if (isDisabled) return;

    setQuantityError("");

    const hasSale = product?.salePrice && Number(product.salePrice) < Number(product.regularPrice);
    const effectivePrice = hasSale ? Number(product.salePrice) : Number(product.regularPrice);

    // Fire all UI updates immediately — don't await
    flyToCart({ imageUrl: product.images?.[0]?.imageUrl, sourceEl: btnRef.current });
    addToCart(variant.id, quantity, {
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
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(1);
    }, 2000);
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
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: "var(--text-primary)" }}
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
              disabled={quantity >= maxStock}
              className="w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: "var(--text-primary)" }}
            >
              +
            </button>
          </div>

          {/* Add to cart - black pill */}
          <button
            ref={btnRef}
            onClick={handleAddToCart}
            disabled={isDisabled}
            className="flex-1 h-10 rounded-full font-semibold text-sm transition-colors"
            style={{
              background: added
                ? "var(--success)"
                : isDisabled
                  ? "var(--border)"
                  : "var(--ink)",
              color: "#fff",
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isDisabled && !added) e.target.style.background = "var(--ink-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isDisabled && !added) e.target.style.background = "var(--ink)";
            }}
          >
            {added ? "Added ✓" : "Add to cart"}
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
        <p className="text-xs" style={{ color: "var(--danger)" }}>{quantityError}</p>
      )}
    </div>
  );
}
