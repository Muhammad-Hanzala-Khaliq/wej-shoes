/**
 * Format price with PKR currency
 * @param {number} price - The price value
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

/**
 * Calculate discount percentage
 * @param {number} regularPrice - Original price
 * @param {number|null} salePrice - Sale price (nullable)
 * @returns {number} Discount percentage (0 if no sale)
 */
export function calculateDiscount(regularPrice, salePrice) {
  if (!salePrice || salePrice >= regularPrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

/**
 * Generate URL-friendly slug from text
 * @param {string} text - Input text
 * @returns {string} URL-friendly slug
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate unique order number
 * @returns {string} Order number in format ORD-timestamp-random
 */
export function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
}

/**
 * Get or create session ID for guest cart from localStorage
 * @returns {string} Session ID
 */
export function getSessionId() {
  if (typeof window === "undefined") return "";
  const key = "guest_session_id";
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

/**
 * Validate Pakistani phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid Pakistani phone
 */
export function validatePhone(phone) {
  const phoneRegex = /^(03[0-9]{2}-?[0-9]{7}|(\+92)3[0-9]{2}-?[0-9]{7})$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Basic email validation
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (e.g., "15 Jan 2024")
 */
export function formatDate(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
