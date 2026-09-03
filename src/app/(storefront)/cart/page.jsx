"use client";

import Link from "next/link";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice } from "@/lib/utils";

function getOptimizedUrl(url, width) {
  if (!url || !url.includes("cloudinary")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem } = useCart();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
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
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-gray-600 mb-8">Your cart is empty</p>
        <Link
          href="/collections/all"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const { product } = item;

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 sm:p-6 flex gap-4"
              >
                {/* Image */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {product.image && (
                    <img
                      src={getOptimizedUrl(product.image, 200)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-semibold text-gray-900 hover:underline line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.variant.color}
                        {item.variant.size && ` / ${item.variant.size}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm font-medium min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {product.salePrice ? (
                        <>
                          <p className="font-semibold">{formatPrice(product.salePrice * item.quantity)}</p>
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(product.regularPrice * item.quantity)}
                          </p>
                        </>
                      ) : (
                        <p className="font-semibold">{formatPrice(product.regularPrice * item.quantity)}</p>
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
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t pt-3 mt-3">
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
              href="/collections/all"
              className="block w-full mt-3 text-center text-gray-600 hover:text-gray-900 text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
