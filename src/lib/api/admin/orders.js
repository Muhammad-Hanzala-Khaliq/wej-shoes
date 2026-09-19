import { apiFetch } from "../client";

export function listOrders(params = {}) {
  const query = new URLSearchParams();
  query.set("page", params.page || "1");
  query.set("limit", params.limit || "20");
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  return apiFetch(`/api/admin/orders?${query}`);
}

export function getOrder(id) {
  return apiFetch(`/api/admin/orders/${id}`);
}

export function updateOrderStatus(orderId, status, reason) {
  return apiFetch("/api/admin/orders", {
    method: "POST",
    body: JSON.stringify({ orderId, status, reason }),
  });
}
