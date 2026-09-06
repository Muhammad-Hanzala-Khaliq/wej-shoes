import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      totalOrders,
      revenueResult,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      lowStockVariants,
      recentOrders,
      customersResult,
    ] = await Promise.all([
      prisma.product.count({
        where: { deletedAt: null },
      }),
      prisma.product.count({
        where: { deletedAt: null, status: "ACTIVE" },
      }),
      prisma.product.count({
        where: { deletedAt: null, status: "DRAFT" },
      }),
      prisma.order.count({
        where: { deletedAt: null },
      }),
      prisma.order.aggregate({
        where: {
          deletedAt: null,
          orderStatus: { notIn: ["CANCELLED"] },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: { deletedAt: null, orderStatus: "PENDING" },
      }),
      prisma.order.count({
        where: { deletedAt: null, orderStatus: "SHIPPED" },
      }),
      prisma.order.count({
        where: { deletedAt: null, orderStatus: "DELIVERED" },
      }),
      prisma.productVariant.findMany({
        where: {
          deletedAt: null,
          status: "ACTIVE",
          stockQuantity: { lte: 5 },
          product: { deletedAt: null },
        },
        include: {
          product: { select: { name: true } },
        },
        orderBy: { stockQuantity: "asc" },
        take: 10,
      }),
      prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.order.findMany({
        where: { deletedAt: null },
        select: { userId: true, customerPhone: true, customerEmail: true },
      }),
    ]);

    const uniqueCustomers = new Set(
      customersResult
        .map((o) => o.userId || o.customerPhone || o.customerEmail)
        .filter(Boolean)
    ).size;

    return NextResponse.json({
      totalProducts,
      activeProducts,
      draftProducts,
      totalOrders,
      totalRevenue: Number(revenueResult._sum.totalAmount || 0),
      totalCustomers: uniqueCustomers,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      lowStockItems: lowStockVariants.length,
      lowStockVariants: lowStockVariants.map((v) => ({
        id: v.id,
        color: v.color,
        size: v.size,
        stockQuantity: v.stockQuantity,
        productName: v.product.name,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: `${o.customerFirstName} ${o.customerLastName}`.trim(),
        totalAmount: Number(o.totalAmount),
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
