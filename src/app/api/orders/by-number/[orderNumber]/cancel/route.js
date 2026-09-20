import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cancelOrderByNumber } from "@/features/orders/order.service";
import { logError } from "@/lib/logger";

/**
 * POST handler - Cancel order by order number
 * Requires authentication + ownership check
 */
export async function POST(request, { params }) {
  try {
    const { orderNumber } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Login required to cancel orders" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    const order = await cancelOrderByNumber(orderNumber, session.user.id, reason);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    logError("POST /api/orders/by-number/[orderNumber]/cancel", error);

    if (error.message === "Order not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message.includes("Cannot cancel")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
