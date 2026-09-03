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

  const handleSizeSelect = (size) => {
    const stock = getStockForSize(size);
    if (stock > 0) {
      setSelectedSize(size);
    }
  };

  const currentVariant = selectedColor && selectedSize ? getVariant(selectedColor, selectedSize) : null;
  const isInStock = currentVariant && currentVariant.stockQuantity > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Color {selectedColor && `- ${selectedColor}`}
        </h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const colorVariants = variants.filter((v) => v.color === color);
            const hasStock = colorVariants.some((v) => v.stockQuantity > 0);
            return (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                disabled={!hasStock}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  selectedColor === color
                    ? "bg-gray-900 text-white border-gray-900"
                    : hasStock
                      ? "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {selectedColor && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((size) => {
              const stock = getStockForSize(size);
              const isAvailable = stock > 0;
              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  disabled={!isAvailable}
                  className={`min-w-[60px] px-4 py-2 text-sm rounded-lg border transition-colors ${
                    selectedSize === size
                      ? "bg-gray-900 text-white border-gray-900"
                      : isAvailable
                        ? "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {currentVariant && (
        <div>
          {isInStock ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Out of Stock
            </span>
          )}
        </div>
      )}

      {!selectedColor && (
        <p className="text-sm text-gray-500">Please select a color</p>
      )}
      {selectedColor && !selectedSize && (
        <p className="text-sm text-gray-500">Please select a size</p>
      )}
    </div>
  );
}
