"use client";

import { useState, useEffect } from "react";

export default function VariantSelector({ variants = [], selectedVariant, onSelectVariant }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const colors = [...new Set(variants.map((v) => v.color))];

  const sizesForColor = selectedColor
    ? [...new Set(variants.filter((v) => v.color === selectedColor).map((v) => v.size))]
    : [];

  const getVariant = (color, size) =>
    variants.find((v) => v.color === color && v.size === size);

  const getStockForSize = (size) => {
    const variant = getVariant(selectedColor, size);
    return variant ? variant.stockQuantity : 0;
  };

  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = getVariant(selectedColor, selectedSize);
      if (variant && variant.stockQuantity > 0 && variant.status === "ACTIVE") {
        onSelectVariant(variant);
      } else {
        onSelectVariant(null);
      }
    }
  }, [selectedColor, selectedSize]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedSize(null);
    onSelectVariant(null);
  };

  const handleSizeChange = (e) => {
    const size = e.target.value;
    if (!size) return;
    const stock = getStockForSize(size);
    if (stock > 0) {
      setSelectedSize(size);
    }
  };

  const currentVariant = selectedColor && selectedSize ? getVariant(selectedColor, selectedSize) : null;
  const isInStock = currentVariant && currentVariant.stockQuantity > 0;

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div>
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
          {selectedColor ? selectedColor : "Select color"}
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const colorVariants = variants.filter((v) => v.color === color);
            const hasStock = colorVariants.some((v) => v.stockQuantity > 0);
            const isSelected = selectedColor === color;
            return (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                disabled={!hasStock}
                className="flex items-center justify-center w-14 h-14 rounded-lg text-[11px] font-medium transition-all duration-200"
                style={{
                  background: "#f2f2f2",
                  border: isSelected ? "2px solid #000000" : "2px solid transparent",
                  opacity: hasStock ? 1 : 0.4,
                  textDecoration: hasStock && !isSelected ? "none" : hasStock ? "none" : "line-through",
                  color: "var(--text-primary)",
                }}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size dropdown */}
      {selectedColor && (
        <div>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
            {selectedSize ? `Size: ${selectedSize}` : "Select size"}
          </p>
          <div className="relative">
            <select
              value={selectedSize || ""}
              onChange={handleSizeChange}
              className="w-full appearance-none px-4 py-3 pr-10 text-sm font-medium rounded-full transition-colors"
              style={{
                border: "1px solid var(--border-strong)",
                background: "var(--surface)",
                color: "var(--text-primary)",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--brand)";
                e.target.style.boxShadow = "0 0 0 3px var(--brand-soft)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-strong)";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">Select a size</option>
              {sizesForColor.map((size) => {
                const stock = getStockForSize(size);
                const isAvailable = stock > 0;
                return (
                  <option key={size} value={size} disabled={!isAvailable}>
                    {size}
                    {!isAvailable ? " (Out of stock)" : ""}
                  </option>
                );
              })}
            </select>
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Stock indicator */}
      {currentVariant && (
        <div className="text-sm" style={{ color: isInStock ? "var(--text-muted)" : "var(--danger)" }}>
          {isInStock ? "In stock" : "Out of stock"}
        </div>
      )}

      {/* Helper text */}
      {!selectedColor && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select color</p>
      )}
      {selectedColor && !selectedSize && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select size</p>
      )}
    </div>
  );
}
