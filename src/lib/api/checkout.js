import { apiFetch } from "./client";

export const getCheckoutVariant = (variantId) =>
  apiFetch(`/api/checkout/variant/${variantId}`);

export const getShippingRules = () => apiFetch("/api/shipping-rules");
