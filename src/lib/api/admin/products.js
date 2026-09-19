import { apiFetch } from "../client";

export function listProducts(params = {}) {
  const query = new URLSearchParams();
  query.set("page", params.page || "1");
  query.set("limit", params.limit || "20");
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.gender) query.set("gender", params.gender);
  if (params.isFeatured !== undefined) query.set("isFeatured", params.isFeatured);
  return apiFetch(`/api/admin/products?${query}`);
}

export function getProduct(id) {
  return apiFetch(`/api/admin/products/${id}`);
}

export function createProduct(data) {
  return apiFetch("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(id, data) {
  return apiFetch(`/api/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id) {
  return apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
}
