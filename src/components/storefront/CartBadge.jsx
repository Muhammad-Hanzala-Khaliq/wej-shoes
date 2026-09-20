"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/features/cart/CartProvider";

export default function CartBadge() {
  const { cart } = useCart();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    function handleBump() {
      setBump(true);
      setTimeout(() => setBump(false), 600);
    }
    window.addEventListener("cart:bump", handleBump);
    return () => window.removeEventListener("cart:bump", handleBump);
  }, []);

  return (
    <Link
      href="/cart"
      data-cart-target
      className="relative p-2 text-gray-600 hover:text-black transition-colors"
      aria-label={`Shopping cart${cart.itemCount > 0 ? `, ${cart.itemCount} items` : ""}`}
    >
      <svg
        className={`w-5 h-5 ${bump ? "cart-bump" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {cart.itemCount > 0 && (
        <span
          key={cart.itemCount}
          className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium ${bump ? "cart-bump" : ""}`}
        >
          {cart.itemCount > 99 ? "99+" : cart.itemCount}
        </span>
      )}
    </Link>
  );
}
