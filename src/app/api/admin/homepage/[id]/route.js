import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { updateHomepageContent, deleteHomepageContent } from "@/features/cms/cms.service";

/**
 * PUT handler - Update homepage content (admin only)
 */
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const content = await updateHomepageContent(id, body);
    return NextResponse.json(content);
  } catch (error) {
    console.error("PUT /api/admin/homepage/[id] error:", error);

    if (error.message === "Content not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update content" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Delete homepage content (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteHomepageContent(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE /api/admin/homepage/[id] error:", error);

    if (error.message === "Content not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete content" },
      { status: 500 }
    );
  }
}
