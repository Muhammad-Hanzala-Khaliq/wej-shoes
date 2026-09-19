"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice } from "@/lib/utils";
import { getShippingRules } from "@/lib/api/checkout";

function getOptimizedUrl(url, width) {
  if (!url || !url.includes("cloudinary")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}

export default function CartClient() {
  const { cart, isLoading, updateQuantity, removeItem } = useCart();
  const [removingId, setRemovingId] = useState(null);
  const [shippingRules, setShippingRules] = useState([]);

  useEffect(() => {
    async function fetchShippingRules() {
      try {
        const data = await getShippingRules();
        setShippingRules(data);
      } catch {}
    }
    fetchShippingRules();
  }, []);

  let shippingFee = 200;
  let freeShippingThreshold = 5000;
  if (shippingRules.length > 0) {
    const activeRule = shippingRules.find((r) => r.type === "FLAT" || r.type === "FREE") || shippingRules[0];
    if (activeRule) {
      shippingFee = Number(activeRule.amount) || 0;
      freeShippingThreshold = activeRule.freeShippingThreshold ? Number(activeRule.freeShippingThreshold) : null;
    }
  }
  const qualifiesForFreeShipping = freeShippingThreshold && cart.subtotal >= freeShippingThreshold;
  const finalShippingFee = qualifiesForFreeShipping ? 0 : shippingFee;
  const total = cart.subtotal + finalShippingFee;

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty < 1) return;
    updateQuantity(itemId, newQty);
  };

  const handleRemove = (itemId) => {
    setRemovingId(itemId);
    setTimeout(() => {
      removeItem(itemId);
      setRemovingId(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="container-page section">
        <h1 className="heading-lg mb-8" style={{ color: "var(--text-primary)" }}>Shopping Cart</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg" style={{ background: "var(--surface-soft)" }} />
                <div className="flex-1 space-y-3">
                  <div className="h-4 rounded w-1/3" style={{ background: "var(--surface-soft)" }} />
                  <div className="h-3 rounded w-1/4" style={{ background: "var(--surface-soft)" }} />
                  <div className="h-3 rounded w-1/6" style={{ background: "var(--surface-soft)" }} />
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
      <div className="container-page section text-center">
        <svg
          className="mx-auto h-24 w-24 mb-6"
          style={{ color: "var(--text-muted)" }}
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
        <h1 className="heading-lg mb-2" style={{ color: "var(--text-primary)" }}>Your cart is empty</h1>
        <p className="mb-8" style={{ color: "var(--text-muted)" }}>
          Looks like you haven&apos;t added any items yet.
        </p>
        <Link href="/collections/men" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page section">
      <h1 className="heading-lg mb-8" style={{ color: "var(--text-primary)" }}>
        Shopping Cart ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const { product } = item;
            const isRemoving = removingId === item.id;

            return (
              <div
                key={item.id}
                className={`grid transition-all duration-300 ease-in-out ${isRemoving ? "grid-rows-[0fr] opacity-0 translate-x-6" : "grid-rows-[1fr] opacity-100"}`}
              >
                <div className="overflow-hidden">
                  <div className="card p-4 sm:p-6 flex gap-4">
                    <Link
                      href={`/product/${product.slug}`}
                      className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden"
                      style={{ background: "var(--surface-soft)" }}
                    >
                      {product.image ? (
                        <img
                          src={getOptimizedUrl(product.image, 200)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-semibold link line-clamp-1"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                            Color: {item.variant.color}
                            {item.variant.size && <> | Size: {item.variant.size}</>}
                          </p>
                          {item.variant.sku && (
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                              SKU: {item.variant.sku}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1 flex-shrink-0 transition-colors"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--danger)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div
                          className="flex items-center rounded-lg"
                          style={{ border: "1px solid var(--border)" }}
                        >
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={(e) => !e.target.disabled && (e.target.style.background = "var(--surface-soft)")}
                            onMouseLeave={(e) => e.target.style.background = "transparent"}
                          >
                            -
                          </button>
                          <span
                            className="px-3 py-1.5 text-sm font-medium min-w-[36px] text-center"
                            style={{ borderInline: "1px solid var(--border)", color: "var(--text-primary)" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={(e) => !e.target.disabled && (e.target.style.background = "var(--surface-soft)")}
                            onMouseLeave={(e) => e.target.style.background = "transparent"}
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {formatPrice(item.linePrice)}
                          </p>
                          {product.salePrice && (
                            <p className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
                              {formatPrice(product.regularPrice * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div
            className="card p-6 sticky top-24"
            style={{ background: "var(--surface-soft)" }}
          >
            <h2 className="heading-md mb-4" style={{ color: "var(--text-primary)" }}>Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Delivery</span>
                <span
                  className="font-medium"
                  style={{ color: finalShippingFee === 0 ? "var(--success)" : "var(--text-primary)" }}
                >
                  {finalShippingFee === 0 ? "Free" : formatPrice(finalShippingFee)}
                </span>
              </div>
              {finalShippingFee > 0 && freeShippingThreshold && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Free shipping on orders over PKR {freeShippingThreshold.toLocaleString("en-PK")}
                </p>
              )}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
                <div className="flex justify-between text-base font-semibold">
                  <span style={{ color: "var(--text-primary)" }}>Total</span>
                  <span style={{ color: "var(--text-primary)" }}>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
              Cash on Delivery (COD) - Pay when you receive your order
            </p>

            <Link
              href="/checkout"
              className="btn btn-primary btn-full mt-6"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/collections/men"
              className="btn btn-ghost btn-full mt-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
