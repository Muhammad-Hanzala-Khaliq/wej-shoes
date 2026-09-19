import { apiFetch } from "../client";

export function listCategories({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiFetch(`/api/admin/categories${qs ? `?${qs}` : ""}`);
}

export function getCategory(id) {
  return apiFetch(`/api/admin/categories/${id}`);
}

export function createCategory(data) {
  return apiFetch("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategory(id, data) {
  return apiFetch(`/api/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(id) {
  return apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
}
