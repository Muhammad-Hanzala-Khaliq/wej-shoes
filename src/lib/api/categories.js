import { apiFetch } from "./client";

export const getCategories = () => apiFetch("/api/categories");
