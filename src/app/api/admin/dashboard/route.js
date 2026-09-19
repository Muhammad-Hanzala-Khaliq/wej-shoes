import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDashboardStats } from "@/features/admin/dashboard.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get admin dashboard stats
 */
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    logError("/api/admin/dashboard", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
