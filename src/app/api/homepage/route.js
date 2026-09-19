import { NextResponse } from "next/server";
import { getActiveHomepageContent } from "@/features/cms/homepage.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get active homepage content (PUBLIC)
 */
export async function GET() {
  try {
    const content = await getActiveHomepageContent();
    return NextResponse.json(content);
  } catch (error) {
    logError("/api/homepage", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage content" },
      { status: 500 }
    );
  }
}
