import { apiFetch } from "./client";

export const getSettings = () => apiFetch("/api/settings");
