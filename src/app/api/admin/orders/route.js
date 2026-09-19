import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listAdminOrders, transitionOrderStatus } from "@/features/orders/order.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - List all orders (admin only)
 */
export async function GET(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status") || null;
    const search = searchParams.get("search") || null;

    const data = await listAdminOrders({ page, limit, status, search });
    return NextResponse.json(data);
  } catch (error) {
    logError("GET /api/admin/orders", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Update order status (admin only)
 */
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status, reason } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required" },
        { status: 400 }
      );
    }

    const updatedOrder = await transitionOrderStatus(orderId, status, reason, session.user.id);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    logError("POST /api/admin/orders", error);

    if (error.message === "Order not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message.startsWith("Cannot transition")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
