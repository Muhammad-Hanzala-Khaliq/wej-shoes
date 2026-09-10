import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [recentOrders, totalOrders, orderStats] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          orderStatus: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({
        where: { userId: session.user.id, deletedAt: null },
      }),
      prisma.order.aggregate({
        where: { userId: session.user.id, deletedAt: null },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalSpent = Number(orderStats._sum.totalAmount || 0);

    const memberSince = new Date(user.createdAt);
    const now = new Date();
    const diffMs = now - memberSince;
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    const memberDuration =
      diffMonths >= 12
        ? `${Math.floor(diffMonths / 12)} year${Math.floor(diffMonths / 12) > 1 ? "s" : ""}`
        : `${diffMonths || 1} month${diffMonths !== 1 ? "s" : ""}`;

    return NextResponse.json({
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        createdAt: user.createdAt,
      },
      recentOrders: recentOrders.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
      })),
      stats: {
        totalOrders,
        totalSpent,
        memberDuration,
      },
    });
  } catch (error) {
    console.error("GET /api/account error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch account" },
      { status: 500 }
    );
  }
}
