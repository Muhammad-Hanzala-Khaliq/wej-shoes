import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/db";

const VALID_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

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
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.orderStatus = status;
    if (search) where.orderNumber = { contains: search, mode: "insensitive" };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          _count: {
            select: { items: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate status transition
    const allowed = VALID_TRANSITIONS[order.orderStatus] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.orderStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Update in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: status,
          paymentStatus: status === "CANCELLED" ? "CANCELLED" : order.paymentStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          notes: reason || `Status updated to ${status}`,
          createdBy: session.user.id,
        },
      });

      // Restore stock if cancelled
      if (status === "CANCELLED") {
        for (const item of order.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (variant) {
            const previousQuantity = variant.stockQuantity;
            const newQuantity = previousQuantity + item.quantity;

            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: newQuantity },
            });

            await tx.inventoryHistory.create({
              data: {
                variantId: item.variantId,
                previousQuantity,
                changeQuantity: item.quantity,
                newQuantity,
                reason: "ORDER_CANCELLED",
                referenceType: "ORDER",
                referenceId: orderId,
                createdBy: session.user.id,
              },
            });
          }
        }
      }

      return updated;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("POST /api/admin/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
