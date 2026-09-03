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
 * Check if pathname is an admin route
 * @param {string} pathname
 * @returns {boolean}
 */
export function isAdminRoute(pathname) {
  return pathname.startsWith("/admin");
}
