"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice } from "@/lib/utils";

function getOptimizedUrl(url, width) {
  if (!url || !url.includes("cloudinary")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem } = useCart();
  const [updatingId, setUpdatingId] = useState(null);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    setUpdatingId(itemId);
    await updateQuantity(itemId, newQty);
    setUpdatingId(null);
  };

  const handleRemove = async (itemId, productName) => {
    if (!confirm(`Remove "${productName}" from cart?`)) return;
    await removeItem(itemId);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <svg
          className="mx-auto h-24 w-24 text-gray-300 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">
          Looks like you haven&apos;t added any items yet.
        </p>
        <Link
          href="/collections/men"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        Shopping Cart ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const { product } = item;
            const isUpdating = updatingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 sm:p-6 flex gap-4 border border-gray-100"
              >
                {/* Image */}
                <Link
                  href={`/product/${product.slug}`}
                  className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                >
                  {product.image ? (
                    <img
                      src={getOptimizedUrl(product.image, 200)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-semibold text-gray-900 hover:underline line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Color: {item.variant.color}
                        {item.variant.size && <> | Size: {item.variant.size}</>}
                      </p>
                      {item.variant.sku && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          SKU: {item.variant.sku}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.id, product.name)}
                      className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium min-w-[36px] text-center border-x border-gray-200">
                        {isUpdating ? (
                          <svg className="animate-spin h-4 w-4 mx-auto text-gray-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(product.salePrice ? product.salePrice * item.quantity : product.regularPrice * item.quantity)}
                      </p>
                      {product.salePrice && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatPrice(product.regularPrice * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Cash on Delivery (COD) - Pay when you receive your order
            </p>

            <Link
              href="/checkout"
              className="block w-full mt-6 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-gray-800 transition-colors"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/collections/men"
              className="block w-full mt-3 text-center text-gray-600 hover:text-gray-900 text-sm py-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
