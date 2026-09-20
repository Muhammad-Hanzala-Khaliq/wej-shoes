import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST handler — Check login rate limit status for an email.
 * Called by LoginForm BEFORE signIn to detect rate limiting.
 * Returns { allowed, remaining, retryAfter }.
 */
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const identifier = email.toLowerCase().trim();
    const result = checkRateLimit(identifier);

    return NextResponse.json({
      allowed: result.allowed,
      remaining: result.remaining,
      retryAfter: result.retryAfter
        ? result.retryAfter.toISOString()
        : null,
    });
  } catch {
    // If rate limiter fails for any reason, allow the attempt
    return NextResponse.json({ allowed: true, remaining: 5, retryAfter: null });
  }
}
