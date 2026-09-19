import { apiFetch } from "./client";

export const getCart = () => apiFetch("/api/cart");

export const addToCart = (body) =>
  apiFetch("/api/cart", { method: "POST", body });

export const updateCartItem = (itemId, quantity) =>
  apiFetch(`/api/cart/${itemId}`, { method: "PUT", body: { quantity } });

export const removeCartItem = (itemId) =>
  apiFetch(`/api/cart/${itemId}`, { method: "DELETE" });

export const clearCart = () =>
  apiFetch("/api/cart", { method: "DELETE" });

export const mergeCart = () =>
  apiFetch("/api/cart/merge", { method: "POST" });
