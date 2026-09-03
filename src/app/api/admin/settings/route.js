import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getStoreSettings, updateStoreSettings } from "@/features/cms/cms.service";

/**
 * GET handler - Get store settings (admin only)
 */
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getStoreSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Update store settings (admin only)
 */
export async function PUT(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const settings = await updateStoreSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
