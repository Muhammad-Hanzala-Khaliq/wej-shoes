import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET handler - Get active homepage content (PUBLIC)
 */
export async function GET() {
  try {
    const content = await prisma.homepageContent.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("GET /api/homepage error:", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage content" },
      { status: 500 }
    );
  }
}
