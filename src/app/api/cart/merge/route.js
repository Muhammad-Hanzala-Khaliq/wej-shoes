import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { mergeGuestCartToUser } from "@/features/cart/cart.service";

/**
 * POST handler - Merge guest cart into user cart
 * @returns {NextResponse}
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Login required" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("guest_session_id")?.value;

    if (!sessionId) {
      return NextResponse.json({ items: [], subtotal: 0, itemCount: 0, cartId: null });
    }

    const cart = await mergeGuestCartToUser({
      sessionId,
      userId: session.user.id,
    });

    const response = NextResponse.json(cart);
    response.cookies.set("guest_session_id", "", {
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/cart/merge error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to merge cart" },
      { status: 500 }
    );
  }
}
