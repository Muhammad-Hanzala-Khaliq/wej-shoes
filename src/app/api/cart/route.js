import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getCart, addToCart, clearCart } from "@/features/cart/cart.service";

function getSessionId(cookieStore) {
  return cookieStore.get("guest_session_id")?.value || null;
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
    console.error("GET /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
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

    const cart = await addToCart({ userId, sessionId, variantId, quantity });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("POST /api/cart error:", error);

    if (error.message === "Insufficient stock") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message.includes("not found") || error.message.includes("not available")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to add to cart" },
      { status: 500 }
    );
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
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear cart" },
      { status: 500 }
    );
  }
}
