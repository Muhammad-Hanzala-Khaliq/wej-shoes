import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET handler - Get store settings (PUBLIC)
 */
export async function GET() {
  try {
    const settings = await prisma.storeSettings.findFirst();

    if (!settings) {
      return NextResponse.json({
        storeName: "WEJ Shoes",
        currency: "PKR",
        codEnabled: true,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
