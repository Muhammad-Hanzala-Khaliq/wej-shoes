import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const rules = await prisma.shippingRule.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Failed to fetch shipping rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping rules" },
      { status: 500 }
    );
  }
}
