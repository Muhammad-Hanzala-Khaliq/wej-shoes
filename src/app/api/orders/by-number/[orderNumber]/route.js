import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrderByNumberWithAuth } from "@/features/orders/order.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get order by order number (PUBLIC)
 * Validates ownership for logged-in users
 */
export async function GET(request, { params }) {
  try {
    const { orderNumber } = await params;
    const session = await auth();
    const userId = session?.user?.id || null;

    const order = await getOrderByNumberWithAuth(orderNumber, userId);
    return NextResponse.json(order);
  } catch (error) {
    logError("/api/orders/by-number", error);

    if (error.message === "Order not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === "Login required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
