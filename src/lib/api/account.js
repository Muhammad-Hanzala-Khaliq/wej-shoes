import { apiFetch } from "./client";

export const getAccount = () => apiFetch("/api/account");
