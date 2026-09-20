/**
 * In-memory rate limiter — zero DB calls, <1ms overhead.
 * Simple Map-based approach with window cleanup.
 */

const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if an identifier is allowed to attempt.
 * @param {string} identifier - Typically "email|ip"
 * @param {number} [maxAttempts=5]
 * @param {number} [windowMs=900000]
 * @returns {{ allowed: boolean, remaining: number, retryAfter: Date | null }}
 */
export function checkRateLimit(identifier, maxAttempts = MAX_ATTEMPTS, windowMs = WINDOW_MS) {
  const now = Date.now();
  const userAttempts = attempts.get(identifier) || [];

  // Clean old attempts outside window
  const recentAttempts = userAttempts.filter((time) => now - time < windowMs);
  attempts.set(identifier, recentAttempts);

  if (recentAttempts.length >= maxAttempts) {
    const oldestAttempt = recentAttempts[0];
    const retryAfter = new Date(oldestAttempt + windowMs);
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining: maxAttempts - recentAttempts.length, retryAfter: null };
}

/**
 * Record a failed attempt for an identifier.
 * @param {string} identifier
 */
export function incrementAttempts(identifier) {
  const userAttempts = attempts.get(identifier) || [];
  userAttempts.push(Date.now());
  attempts.set(identifier, userAttempts);
}

/**
 * Reset all attempts for an identifier (called on successful login).
 * @param {string} identifier
 */
export function resetAttempts(identifier) {
  attempts.delete(identifier);
}
