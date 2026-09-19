import { apiFetch } from "./client";

export const searchProducts = (query) =>
  apiFetch(`/api/search?q=${encodeURIComponent(query)}`);
