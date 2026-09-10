"use client";

import { useState, useEffect } from "react";

export default function VariantSelector({ variants = [], selectedVariant, onSelectVariant }) {
  const [selectedSize, setSelectedSize] = useState(null);

  const sizes = [...new Set(variants.map((v) => v.size))];

  const getVariant = (size) =>
    variants.find((v) => v.size === size);

  const getStockForSize = (size) => {
    const variant = getVariant(size);
    return variant ? variant.stockQuantity : 0;
  };

  useEffect(() => {
    if (selectedSize) {
      const variant = getVariant(selectedSize);
      if (variant && variant.stockQuantity > 0 && variant.status === "ACTIVE") {
        onSelectVariant(variant);
      } else {
        onSelectVariant(null);
      }
    }
  }, [selectedSize]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const currentVariant = selectedSize ? getVariant(selectedSize) : null;
  const isInStock = currentVariant && currentVariant.stockQuantity > 0;

  return (
    <div className="space-y-4">
      {/* Size label */}
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {selectedSize ? `Size: ${selectedSize}` : "Shoe size"}
      </p>

      {/* Size pills */}
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const stock = getStockForSize(size);
          const isAvailable = stock > 0;
          const isSelected = selectedSize === size;
          return (
            <button
              key={size}
              onClick={() => handleSizeSelect(size)}
              disabled={!isAvailable}
              className="flex items-center justify-center w-14 h-14 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: isSelected ? "#000000" : "#f2f2f2",
                color: isSelected ? "#ffffff" : "var(--text-primary)",
                border: isSelected ? "2px solid #000000" : "2px solid transparent",
                opacity: isAvailable ? 1 : 0.4,
                textDecoration: isAvailable ? "none" : "line-through",
              }}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Stock indicator */}
      {currentVariant && (
        <div className="text-sm" style={{ color: isInStock ? "var(--text-muted)" : "var(--danger)" }}>
          {isInStock ? "In stock" : "Out of stock"}
        </div>
      )}

      {/* Helper text */}
      {!selectedSize && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select a size</p>
      )}
    </div>
  );
}
