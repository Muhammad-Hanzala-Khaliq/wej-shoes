/**
 * Shared shipping calculation — the SINGLE source of truth for shipping cost.
 *
 * Used by:
 * - createOrder (server) → saved to Order.shippingFee / totalAmount
 * - CartClient & CheckoutClient (display) → same numbers the order will store
 *
 * Hard rule: the client only ever *displays* this calculation. The server
 * always recomputes it from the DB shipping rules — shipping costs sent by
 * the client are never trusted.
 */

/** Fallback when there are no active shipping rules at all. */
export const DEFAULT_SHIPPING_FEE = 250;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 5000;

/**
 * Resolve the shipping fee for a subtotal using the admin shipping rules.
 * @param {Array<{type?: string, amount?: number|string, freeShippingThreshold?: number|string|null}>} rules
 *        Active shipping rules (from /api/shipping-rules or prisma.shippingRule)
 * @param {number} subtotal - Cart/order subtotal
 * @returns {{ fee: number, freeShippingThreshold: number|null }}
 *          fee — shipping charge for this subtotal (0 when free shipping applies)
 *          freeShippingThreshold — threshold to display, or null when none
 */
export function resolveShipping(rules, subtotal) {
  const list = Array.isArray(rules) ? rules : [];

  let fee = DEFAULT_SHIPPING_FEE;
  let threshold = DEFAULT_FREE_SHIPPING_THRESHOLD;

  const rule = list.find((r) => r.type === "FLAT" || r.type === "FREE") || list[0];
  if (rule) {
    fee = Number(rule.amount) || 0;
    threshold = rule.freeShippingThreshold ? Number(rule.freeShippingThreshold) : null;
  }

  const qualifiesForFreeShipping = threshold != null && subtotal >= threshold;

  return {
    fee: qualifiesForFreeShipping ? 0 : fee,
    freeShippingThreshold: threshold,
  };
}
