import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { updateCartItemQuantity, removeCartItem } from "@/features/cart/cart.service";

function getSessionId(cookieStore) {
  return cookieStore.get("guest_session_id")?.value || null;
}

/**
 * PUT handler - Update cart item quantity
 * @param {Request} request
 * @param {Object} params
 * @param {string} params.itemId
 * @returns {NextResponse}
 */
export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const sessionId = getSessionId(cookieStore);
    const session = await auth();
    const userId = session?.user?.id || null;

    const { itemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: "quantity is required" },
        { status: 400 }
      );
    }

    const cart = await updateCartItemQuantity({
      userId,
      sessionId,
      itemId,
      quantity,
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("PUT /api/cart/[itemId] error:", error);

    if (error.message === "Insufficient stock") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Remove cart item
 * @param {Request} request
 * @param {Object} params
 * @param {string} params.itemId
 * @returns {NextResponse}
 */
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const sessionId = getSessionId(cookieStore);
    const session = await auth();
    const userId = session?.user?.id || null;

    const { itemId } = await params;

    const cart = await removeCartItem({ userId, sessionId, itemId });

    return NextResponse.json({ message: "Item removed", cart });
  } catch (error) {
    console.error("DELETE /api/cart/[itemId] error:", error);

    if (error.message.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to remove item" },
      { status: 500 }
    );
  }
}
