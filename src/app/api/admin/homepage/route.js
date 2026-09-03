import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllHomepageContent, createHomepageContent, reorderHomepageContent } from "@/features/cms/cms.service";

/**
 * GET handler - Get all homepage content (admin only)
 */
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await getAllHomepageContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("GET /api/admin/homepage error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch homepage content" },
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
    console.error("POST /api/admin/homepage error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create content" },
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
    console.error("PUT /api/admin/homepage reorder error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reorder content" },
      { status: 500 }
    );
  }
}
