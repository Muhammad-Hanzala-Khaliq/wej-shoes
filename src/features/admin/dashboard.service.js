import prisma from "@/lib/db";

/**
 * Get admin dashboard statistics
 * @returns {Promise<Object>} Dashboard stats
 */
export async function getDashboardStats() {
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
    prisma.order.groupBy({
      by: ["userId"],
      where: { deletedAt: null, userId: { not: null } },
    }),
  ]);

  const uniqueCustomers = customersResult.length;

  return {
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
  };
}
