import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminOrderDetail } from "@/features/orders/order.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get order details (admin only)
 */
export async function GET(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const order = await getAdminOrderDetail(orderId);
    return NextResponse.json(order);
  } catch (error) {
    logError("GET /api/admin/orders/[orderId]", error);

    if (error.message === "Order not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
