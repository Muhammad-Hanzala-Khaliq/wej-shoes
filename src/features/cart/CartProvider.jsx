"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getSessionId } from "@/lib/utils";
import { getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem, clearCart as apiClearCart, mergeCart as apiMergeCart } from "@/lib/api/cart";
import { logError } from "@/lib/logger";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "wej_cart";

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

/** Write cart to localStorage (write-only during session). */
function persistCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // storage full or private browsing — ignore
  }
}

/** Read cart from localStorage (only on first load). */
function readCartStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0, cartId: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const cartRef = useRef(cart);
  const pendingAddsRef = useRef({});
  const intentsRef = useRef({});
  const hydratedRef = useRef(false);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // ── Hydration: localStorage (instant) → server (authoritative) ──────────
  useEffect(() => {
    const sessionId = getSessionId();
    if (sessionId) {
      document.cookie = `guest_session_id=${sessionId}; path=/; max-age=${30 * 24 * 60 * 60}`;
    }

    // 1. Instant: read localStorage for immediate UI (if any)
    const cached = readCartStorage();
    if (cached && cached.items && cached.items.length > 0) {
      setCart(cached);
    }

    // 2. Authoritative: fetch from server, then overwrite
    let cancelled = false;
    async function load() {
      try {
        const data = await getCart();
        if (!cancelled) {
          setCart(data);
          persistCart(data);
        }
      } catch {
        // ignore — keep localStorage cache or empty state
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          hydratedRef.current = true;
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Persist to localStorage on every cart change (after hydration)
  useEffect(() => {
    if (hydratedRef.current) {
      persistCart(cart);
    }
  }, [cart]);

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

  // ── ADD TO CART ──────────────────────────────────────────────────────────
  const addToCart = useCallback(async (variantId, quantity = 1, snapshot = null) => {
    try {
      setError(null);

      // Prevent duplicate concurrent adds for same variant
      if (pendingAddsRef.current[variantId]) {
        return { success: false, error: "Already adding to cart" };
      }

      // Client-side stock pre-check (instant, no API call)
      if (snapshot && snapshot.stockQuantity !== undefined) {
        const currentInCart = cartRef.current.items.find(
          (i) => i.variantId === variantId
        );
        const currentQty = currentInCart ? currentInCart.quantity : 0;
        const available = snapshot.stockQuantity - currentQty;

        if (available <= 0) {
          const msg = `You already have the maximum (${snapshot.stockQuantity}) in your cart`;
          setError(msg);
          return { success: false, error: msg };
        }
        if (quantity > available) {
          const msg = `Only ${available} more available`;
          setError(msg);
          return { success: false, error: msg };
        }
      }

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
              // Delete on server in background — no setCart on success
              removeCartItem(realItem.id).catch((err) => {
                logError("cart:backgroundRemove", err, { itemId: realItem.id });
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
              // Update on server in background — no setCart on success
              updateCartItem(realItem.id, intent.qty).catch((err) => {
                logError("cart:backgroundUpdate", err, { itemId: realItem.id, qty: intent.qty });
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
      setError(err.message);
      logError("cart:addToCart", err, { variantId, quantity });
      return { success: false, error: err.message };
    }
  }, [takeIntent]);

  // ── REMOVE ITEM (purely optimistic — context is the single source of truth) ──
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

    // ── Real item: capture state BEFORE optimistic remove for rollback ──
    const previous = cartRef.current;
    const removedItem = previous.items.find((item) => item.id === itemId);

    // 1. Optimistic: remove from context instantly (no await, no flash)
    setCart((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== itemId);
      return recompute(updatedItems);
    });

    // 2. Fire API in background — do NOT await, do NOT replace cart on success
    try {
      setError(null);
      await removeCartItem(itemId);
      // Success: context is already correct. Do NOT setCart from server response.
      return { success: true };
    } catch (err) {
      // 3. Failure ONLY: rollback — re-add the exact item to context
      if (removedItem) {
        setCart((prev) => {
          // Avoid duplicate if somehow already present
          if (prev.items.some((i) => i.id === removedItem.id)) return prev;
          const updatedItems = [...prev.items, removedItem];
          return recompute(updatedItems);
        });
      } else {
        // Fallback: restore full previous state
        setCart(previous);
      }
      setError(err.message || "Failed to remove item");
      return { success: false, error: err.message };
    }
  }, [setIntent]);

  // ── UPDATE QUANTITY ──────────────────────────────────────────────────────
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

  // ── CLEAR CART ───────────────────────────────────────────────────────────
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

  // ── MERGE GUEST→USER (runs only once at login, not on every page load) ──
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
