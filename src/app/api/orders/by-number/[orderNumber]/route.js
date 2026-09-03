import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

/**
 * GET handler - Get order by order number
 * Validates ownership for logged-in users
 */
export async function GET(request, { params }) {
  try {
    const { orderNumber } = await params;
    const session = await auth();
    const userId = session?.user?.id || null;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order has userId, validate current user owns it
    if (order.userId && userId && order.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If order has userId but user is not logged in, deny access
    if (order.userId && !userId) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/by-number error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
