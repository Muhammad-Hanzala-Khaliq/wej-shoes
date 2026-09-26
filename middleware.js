import { auth } from "./src/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Admin routes protection — ALL /admin pages ("/admin-login" does not
  // match "/admin/" so it stays public)
  const isAdminLogin = pathname === "/admin-login";
  const isProtectedAdmin =
    pathname === "/admin" || pathname.startsWith("/admin/");

  // If trying to access protected admin route
  if (isProtectedAdmin) {
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

  // Customer protected routes.
  // NOTE: /checkout, /cart, /track-order, /product/* and /collections/*
  // are PUBLIC — guest checkout must never redirect to /login.
  const customerProtectedRoutes = ["/account", "/orders"];
  const isCustomerProtected = customerProtectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

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
  matcher: [
    "/account/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/admin-login",
    "/login",
    "/signup",
  ],
};
