import { NextResponse } from "next/server";
import { getActiveShippingRules } from "@/features/cms/cms.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get active shipping rules (PUBLIC)
 */
export async function GET() {
  try {
    const rules = await getActiveShippingRules();
    return NextResponse.json(rules);
  } catch (error) {
    logError("/api/shipping-rules", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping rules" },
      { status: 500 }
    );
  }
}
