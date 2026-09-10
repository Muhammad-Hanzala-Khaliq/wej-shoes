import { auth } from "@/auth";

/**
 * Check if current user is an admin
 * @returns {Promise<Object|null>} Session if admin, null otherwise
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

/**
 * Get admin session with error details for layout/page gates
 * @returns {Promise<{session: Object|null, error: string|null}>}
 *   - { session, error: null } if admin
 *   - { session, error: "unauthenticated" } if no session
 *   - { session, error: "forbidden" } if logged in but not admin
 */
export async function getAdminSession() {
  const session = await auth();

  if (!session || !session.user) {
    return { session: null, error: "unauthenticated" };
  }

  if (session.user.role !== "ADMIN") {
    return { session, error: "forbidden" };
  }

  return { session, error: null };
}

/**
 * Check if pathname is an admin route
 * @param {string} pathname
 * @returns {boolean}
 */
export function isAdminRoute(pathname) {
  return pathname.startsWith("/admin");
}
