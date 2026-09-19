import { NextResponse } from "next/server";
import { getStoreSettings } from "@/features/cms/cms.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get store settings (PUBLIC)
 */
export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(settings);
  } catch (error) {
    logError("/api/settings", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
