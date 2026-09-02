import { auth } from "./src/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/account", "/checkout"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // Auth routes that logged-in users should not access
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If trying to access protected route without session
  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  // If logged-in user tries to access login or signup
  if (isAuthRoute && req.auth) {
    return Response.redirect(new URL("/account", req.nextUrl.origin));
  }

  return;
});

export const config = {
  matcher: ["/account/:path*", "/checkout", "/login", "/signup"],
};
