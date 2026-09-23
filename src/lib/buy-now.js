/**
 * Buy Now session helpers (sessionStorage — not localStorage).
 *
 * The Buy Now flow passes ?variant=...&quantity=...&buyNow=true in the URL.
 * sessionStorage acts as a fallback so checkout can still recover the product
 * (and send the user back to its page) if the URL params get stripped or the
 * snapshot expires. Cleared after a successful order.
 */

const BUY_NOW_KEY = "wej_buy_now";
const BUY_NOW_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Save the Buy Now snapshot.
 * @param {Object} params
 * @param {string} params.variantId
 * @param {number} [params.quantity]
 * @param {string} params.slug - Product slug (for redirect fallback)
 */
export function saveBuyNow({ variantId, quantity = 1, slug }) {
  try {
    sessionStorage.setItem(
      BUY_NOW_KEY,
      JSON.stringify({ variantId, quantity, slug, savedAt: Date.now() })
    );
  } catch {
    // storage unavailable (private browsing) — URL params still work
  }
}

/**
 * Read the Buy Now snapshot.
 * @returns {Object|null} Snapshot with `expired: true` when older than TTL,
 *                        or null when nothing is stored.
 */
export function readBuyNow() {
  try {
    const raw = sessionStorage.getItem(BUY_NOW_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.variantId) return null;
    const expired = Date.now() - (data.savedAt || 0) > BUY_NOW_TTL;
    return { ...data, expired };
  } catch {
    return null;
  }
}

/** Clear the Buy Now snapshot (after a successful order). */
export function clearBuyNow() {
  try {
    sessionStorage.removeItem(BUY_NOW_KEY);
  } catch {
    // ignore
  }
}
