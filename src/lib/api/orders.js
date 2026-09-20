import { apiFetch } from "./client";

export const placeOrder = (body) =>
  apiFetch("/api/orders", { method: "POST", body, throwOnError: false });

export const trackOrder = (orderNumber, phone) =>
  apiFetch("/api/orders/track", { method: "POST", body: { orderNumber, phone } });

export const getOrderByNumber = (orderNumber) =>
  apiFetch(`/api/orders/by-number/${orderNumber}`);

export const getOrders = (page = 1, limit = 10) =>
  apiFetch(`/api/orders?page=${page}&limit=${limit}`);

export const cancelOrder = (orderNumber, reason = "") =>
  apiFetch(`/api/orders/by-number/${orderNumber}/cancel`, {
    method: "POST",
    body: { reason },
    throwOnError: false,
  });
