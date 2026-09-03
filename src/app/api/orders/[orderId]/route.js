import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrderById, cancelOrder } from "@/features/orders/order.service";

/**
 * GET handler - Get order by ID
 * Logged-in users can view their orders
 * Guests can view orders via confirmation page
 */
export async function GET(request, { params }) {
  try {
    const { orderId } = await params;
    const session = await auth();
    const userId = session?.user?.id || null;

    const order = await getOrderById(orderId, userId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[orderId] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Cancel order
 */
export async function POST(request, { params }) {
  try {
    const { orderId } = await params;
    const session = await auth();
    const userId = session?.user?.id || null;

    const body = await request.json();
    const { reason } = body;

    const order = await cancelOrder(orderId, userId, reason);

    return NextResponse.json(order);
  } catch (error) {
    console.error("POST /api/orders/[orderId] error:", error);

    if (error.message === "Order not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message.includes("Cannot cancel")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
