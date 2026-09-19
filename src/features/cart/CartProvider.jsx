"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getSessionId } from "@/lib/utils";
import { getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem, clearCart as apiClearCart, mergeCart as apiMergeCart } from "@/lib/api/cart";
import { logError } from "@/lib/logger";

const CartContext = createContext(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

function recompute(items) {
  return {
    items,
    subtotal: items.reduce((sum, item) => sum + item.linePrice, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export default function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0, cartId: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const cartRef = useRef(cart);
  const pendingAddsRef = useRef({});
  const intentsRef = useRef({});

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  useEffect(() => {
    const sessionId = getSessionId();
    if (sessionId) {
      document.cookie = `guest_session_id=${sessionId}; path=/; max-age=${30 * 24 * 60 * 60}`;
    }

    let cancelled = false;
    async function load() {
      try {
        const data = await getCart();
        if (!cancelled) {
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
      const data = await getCart();
      setCart(data);
    } catch {
      // ignore
    }
  }, []);

  const setIntent = useCallback((variantId, patch) => {
    intentsRef.current[variantId] = {
      ...(intentsRef.current[variantId] || {}),
      ...patch,
    };
  }, []);

  const takeIntent = useCallback((variantId) => {
    const intent = intentsRef.current[variantId] || null;
    delete intentsRef.current[variantId];
    return intent;
  }, []);

  const addToCart = useCallback(async (variantId, quantity = 1, snapshot = null) => {
    try {
      setError(null);

      const previous = cartRef.current;

      // Optimistic update if snapshot provided
      if (snapshot) {
        setCart((prev) => {
          const existing = prev.items.find((item) => item.variantId === variantId);
          let updatedItems;

          if (existing) {
            updatedItems = prev.items.map((item) =>
              item.variantId === variantId
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    effectivePrice: snapshot.effectivePrice,
                    linePrice: snapshot.effectivePrice * (item.quantity + quantity),
                  }
                : item
            );
          } else {
            const tempItem = {
              id: `temp-${variantId}-${Date.now()}`,
              variantId,
              quantity,
              effectivePrice: snapshot.effectivePrice,
              linePrice: snapshot.effectivePrice * quantity,
              variant: {
                id: variantId,
                sku: snapshot.sku,
                color: snapshot.color,
                size: snapshot.size,
                stockQuantity: snapshot.stockQuantity,
              },
              product: {
                id: snapshot.productId,
                name: snapshot.productName,
                slug: snapshot.slug,
                regularPrice: snapshot.regularPrice,
                salePrice: snapshot.salePrice,
                image: snapshot.image,
              },
            };
            updatedItems = [...prev.items, tempItem];
          }

          return recompute(updatedItems);
        });
      }

      // Create the server promise and store it
      const p = (async () => {
        try {
          const data = await apiAddToCart({ variantId, quantity });

          // Consume any queued intent for this variant before setting cart
          const intent = takeIntent(variantId);

          if (intent && intent.remove) {
            const realItem = (data.items || []).find((i) => i.variantId === variantId);
            if (realItem) {
              setCart(recompute((data.items || []).filter((i) => i.id !== realItem.id)));
              // Delete on server in background
              removeCartItem(realItem.id)
                .then((d) => {
                  if (d && d.cart) setCart(d.cart);
                  else if (d && d.items) setCart(recompute(d.items));
                })
                .catch((err) => {
                  logError("cart:backgroundRemove", err, { itemId: realItem.id });
                  refreshCart();
                });
            } else {
              setCart(recompute(data.items || []));
            }
          } else if (intent && intent.qty != null) {
            const realItem = (data.items || []).find((i) => i.variantId === variantId);
            if (realItem) {
              const updated = {
                ...realItem,
                quantity: intent.qty,
                linePrice: realItem.effectivePrice * intent.qty,
              };
              setCart(recompute((data.items || []).map((i) => (i.id === realItem.id ? updated : i))));
              // Update on server in background
              updateCartItem(realItem.id, intent.qty)
                .then((d) => {
                  if (d && d.items) setCart(recompute(d.items));
                })
                .catch((err) => {
                  logError("cart:backgroundUpdate", err, { itemId: realItem.id, qty: intent.qty });
                  refreshCart();
                });
            } else {
              setCart(recompute(data.items || []));
            }
          } else {
            setCart(recompute(data.items || []));
          }

          return { success: true };
        } catch (err) {
          takeIntent(variantId);
          setCart(previous);
          setError(err.message);
          logError("cart:addToCart", err, { variantId, quantity });
          return { success: false, error: err.message };
        } finally {
          delete pendingAddsRef.current[variantId];
        }
      })();

      pendingAddsRef.current[variantId] = p;
      return p;
    } catch (err) {
      setCart(previous);
      setError(err.message);
      logError("cart:addToCart", err, { variantId, quantity });
      return { success: false, error: err.message };
    }
  }, [refreshCart, takeIntent]);

  const removeItem = useCallback(async (itemId) => {
    // Handle temp items: queue intent, optimistic remove locally
    if (itemId.startsWith("temp-")) {
      const variantId = itemId.replace(/^temp-[^-]+-/, "");
      setIntent(variantId, { remove: true, qty: null });

      setCart((prev) => {
        const updatedItems = prev.items.filter((item) => !item.id.startsWith(`temp-${variantId}-`));
        return recompute(updatedItems);
      });

      return { success: true };
    }

    // Real item: optimistic remove then server fetch
    const previous = cartRef.current;

    setCart((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== itemId);
      return recompute(updatedItems);
    });

    try {
      setError(null);

      const data = await removeCartItem(itemId);

      setCart(recompute(data.cart?.items || data.items || []));
      return { success: true };
    } catch (err) {
      setCart(previous);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [setIntent]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    // Handle temp items: queue intent, optimistic update locally
    if (itemId.startsWith("temp-")) {
      const variantId = itemId.replace(/^temp-[^-]+-/, "");
      setIntent(variantId, { qty: quantity, remove: false });

      setCart((prev) => {
        const updatedItems = prev.items.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity, linePrice: item.effectivePrice * quantity }
            : item
        );
        return recompute(updatedItems);
      });

      return { success: true };
    }

    // Real item: optimistic update then server fetch
    const previous = cartRef.current;

    setCart((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity, linePrice: item.effectivePrice * quantity }
          : item
      );
      return recompute(updatedItems);
    });

    try {
      setError(null);

      const data = await updateCartItem(itemId, quantity);

      setCart(recompute(data.items || []));
      return { success: true };
    } catch (err) {
      setCart(previous);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [removeItem, setIntent]);

  const clearCart = useCallback(async () => {
    const previous = cartRef.current;

    setCart({ items: [], subtotal: 0, itemCount: 0, cartId: null });

    try {
      await apiClearCart();
      return { success: true };
    } catch (err) {
      setCart(previous);
      logError("cart:clearCart", err);
      return { success: false };
    }
  }, []);

  const mergeCart = useCallback(async () => {
    try {
      setError(null);

      const data = await apiMergeCart();

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
