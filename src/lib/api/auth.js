import { apiFetch } from "./client";

export function signup({ firstName, lastName, email, phone, password, confirmPassword }) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: { firstName, lastName, email, phone, password, confirmPassword },
  });
}
