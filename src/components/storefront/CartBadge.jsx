"use client";

import Link from "next/link";
import { useCart } from "@/features/cart/CartProvider";

export default function CartBadge() {
  const { cart } = useCart();

  return (
    <Link
      href="/cart"
      className="relative p-2 text-gray-600 hover:text-black transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {cart.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
          {cart.itemCount > 99 ? "99+" : cart.itemCount}
        </span>
      )}
    </Link>
  );
}
