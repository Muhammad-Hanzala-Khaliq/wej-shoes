import { apiFetch } from "../client";

// Settings
export function getSettings() {
  return apiFetch("/api/admin/settings");
}

export function updateSettings(data) {
  return apiFetch("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Homepage
export function getHomepage({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiFetch(`/api/admin/homepage${qs ? `?${qs}` : ""}`);
}

export function createHomepageBlock(data) {
  return apiFetch("/api/admin/homepage", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateHomepageBlock(id, data) {
  return apiFetch(`/api/admin/homepage/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteHomepageBlock(id) {
  return apiFetch(`/api/admin/homepage/${id}`, { method: "DELETE" });
}

export function reorderHomepageBlocks(order) {
  return apiFetch("/api/admin/homepage", {
    method: "PUT",
    body: JSON.stringify({ action: "reorder", order }),
  });
}

// Shipping
export function getShippingRules({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiFetch(`/api/admin/shipping${qs ? `?${qs}` : ""}`);
}

export function createShippingRule(data) {
  return apiFetch("/api/admin/shipping", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateShippingRule(id, data) {
  return apiFetch(`/api/admin/shipping?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteShippingRule(id) {
  return apiFetch(`/api/admin/shipping?id=${id}`, { method: "DELETE" });
}
