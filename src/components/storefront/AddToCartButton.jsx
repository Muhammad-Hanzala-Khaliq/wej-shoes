"use client";

import { useState } from "react";
import { useCart } from "@/features/cart/CartProvider";

export default function AddToCartButton({ variant, product, disabled }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [quantityError, setQuantityError] = useState("");
  const { addToCart } = useCart();

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

    const result = await addToCart(variant.id, quantity);

    if (result.success) {
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setQuantity(1);
      }, 2000);
    } else {
      setQuantityError(result.error || "Failed to add to cart");
    }
  };

  return (
    <div className="space-y-4">
      {!variant && (
        <p className="text-sm text-gray-500">Please select color and size</p>
      )}
      {variant && variant.stockQuantity === 0 && (
        <p className="text-sm text-red-600">This variant is out of stock</p>
      )}

      {variant && variant.stockQuantity > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Quantity</label>
          <div className="flex items-center border rounded-lg">
            <button
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      )}

      {quantityError && (
        <p className="text-sm text-red-600">{quantityError}</p>
      )}

      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-colors ${
          added
            ? "bg-green-600 text-white"
            : isDisabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        {added ? "Added to Cart!" : "Add to Cart"}
      </button>
    </div>
  );
}
