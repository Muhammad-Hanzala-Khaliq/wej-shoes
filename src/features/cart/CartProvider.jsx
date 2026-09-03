"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSessionId } from "@/lib/utils";

const CartContext = createContext(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0, cartId: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = getSessionId();
    if (sessionId) {
      document.cookie = `guest_session_id=${sessionId}; path=/; max-age=${30 * 24 * 60 * 60}`;
    }

    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        if (!cancelled && response.ok) {
          setCart(data);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      if (response.ok) setCart(data);
    } catch {
      // ignore
    }
  }, []);

  const addToCart = useCallback(async (variantId, quantity = 1) => {
    try {
      setError(null);

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add to cart");
      }

      setCart(data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      setError(null);

      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update cart");
      }

      setCart(data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      setError(null);

      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove item");
      }

      setCart(data.cart);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to clear cart");
      }

      setCart(data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const mergeCart = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch("/api/cart/merge", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to merge cart");
      }

      setCart(data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const value = {
    cart,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    mergeCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
