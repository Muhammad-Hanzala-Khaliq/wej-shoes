import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/db";

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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/admin/orders/[orderId] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
