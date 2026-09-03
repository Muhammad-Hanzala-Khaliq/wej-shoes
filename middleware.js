import { auth } from "./src/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Admin routes protection
  const adminRoutes = ["/admin/dashboard", "/admin/products", "/admin/categories", "/admin/orders", "/admin/settings"];
  const isAdminProtected = adminRoutes.some((route) => pathname.startsWith(route));
  const isAdminLogin = pathname === "/admin-login";

  // If trying to access protected admin route
  if (isAdminProtected) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/admin-login", req.nextUrl.origin));
    }
    if (userRole !== "ADMIN") {
      return Response.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  // If logged-in admin tries to access admin login
  if (isAdminLogin && isLoggedIn && userRole === "ADMIN") {
    return Response.redirect(new URL("/admin/dashboard", req.nextUrl.origin));
  }

  // Customer protected routes
  const customerProtectedRoutes = ["/account", "/checkout"];
  const isCustomerProtected = customerProtectedRoutes.some((route) => pathname.startsWith(route));

  // Auth routes that logged-in users should not access
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If trying to access protected customer route without session
  if (isCustomerProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  // If logged-in user tries to access login or signup
  if (isAuthRoute && isLoggedIn) {
    if (userRole === "ADMIN") {
      return Response.redirect(new URL("/admin/dashboard", req.nextUrl.origin));
    }
    return Response.redirect(new URL("/account", req.nextUrl.origin));
  }

  return;
});

export const config = {
  matcher: ["/account/:path*", "/checkout", "/admin/:path*", "/admin-login", "/login", "/signup"],
};
