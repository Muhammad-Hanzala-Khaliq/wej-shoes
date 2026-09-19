import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllHomepageContent, createHomepageContent, reorderHomepageContent } from "@/features/cms/cms.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get homepage content with pagination (admin only)
 */
export async function GET(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const all = await getAllHomepageContent();
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;
    const items = all.slice(skip, skip + limit);

    return NextResponse.json({ items, total, totalPages, page });
  } catch (error) {
    logError("GET /api/admin/homepage", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Create homepage content (admin only)
 */
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.sectionType) {
      return NextResponse.json(
        { error: "sectionType is required" },
        { status: 400 }
      );
    }

    const content = await createHomepageContent(body);
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    logError("POST /api/admin/homepage", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Reorder homepage content (admin only)
 * Body: { action: "reorder", order: [{ id, sortOrder }] }
 */
export async function PUT(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.action || body.action !== "reorder") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!body.order || !Array.isArray(body.order)) {
      return NextResponse.json({ error: "order array is required" }, { status: 400 });
    }

    const content = await reorderHomepageContent(body.order);
    return NextResponse.json(content);
  } catch (error) {
    logError("PUT /api/admin/homepage", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
