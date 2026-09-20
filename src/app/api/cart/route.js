import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getCart, addToCart, clearCart } from "@/features/cart/cart.service";
import { logError } from "@/lib/logger";

const ADD_TO_CART_DEBOUNCE_MS = 500;
const recentAddRequests = new Map();

function getSessionId(cookieStore) {
  return cookieStore.get("guest_session_id")?.value || null;
}

function getOwnerKey({ userId, sessionId }) {
  return userId || `guest:${sessionId}`;
}

function checkDebounce(ownerKey, variantId) {
  const now = Date.now();
  const key = `${ownerKey}:${variantId}`;
  const lastAt = recentAddRequests.get(key) || 0;

  // Evict old entries (max 1000)
  if (recentAddRequests.size > 1000) {
    for (const [k, t] of recentAddRequests.entries()) {
      if (now - t > ADD_TO_CART_DEBOUNCE_MS * 4) recentAddRequests.delete(k);
    }
  }

  if (now - lastAt < ADD_TO_CART_DEBOUNCE_MS) {
    return true; // blocked
  }

  recentAddRequests.set(key, now);
  return false;
}

/**
 * GET handler - Get cart
 * @returns {NextResponse}
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = getSessionId(cookieStore);
    const session = await auth();
    const userId = session?.user?.id || null;

    const cart = await getCart({ userId, sessionId });

    return NextResponse.json(cart);
  } catch (error) {
    logError("GET /api/cart", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST handler - Add item to cart
 * @param {Request} request
 * @returns {NextResponse}
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = getSessionId(cookieStore);
    const session = await auth();
    const userId = session?.user?.id || null;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "Session required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { variantId, quantity = 1 } = body;

    if (!variantId) {
      return NextResponse.json(
        { error: "variantId is required" },
        { status: 400 }
      );
    }

    // Server-side debounce: reject rapid duplicate adds
    const ownerKey = getOwnerKey({ userId, sessionId });
    if (checkDebounce(ownerKey, variantId)) {
      return NextResponse.json(
        { error: "Please wait before adding again" },
        { status: 429 }
      );
    }

    const cart = await addToCart({ userId, sessionId, variantId, quantity });

    return NextResponse.json(cart);
  } catch (error) {
    logError("POST /api/cart", error);

    if (error.maxQty !== undefined) {
      return NextResponse.json(
        { error: error.message, maxQty: error.maxQty },
        { status: 400 }
      );
    }

    if (error.message.includes("not found") || error.message.includes("not available")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE handler - Clear cart
 * @returns {NextResponse}
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionId = getSessionId(cookieStore);
    const session = await auth();
    const userId = session?.user?.id || null;

    const cart = await clearCart({ userId, sessionId });

    return NextResponse.json(cart);
  } catch (error) {
    logError("DELETE /api/cart", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
