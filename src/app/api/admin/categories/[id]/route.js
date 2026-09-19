import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/features/catalog/category.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Fetch single category by id
 */
export async function GET(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const category = await getCategoryById(id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    logError("/api/admin/categories/[id]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Update category
 */
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const category = await updateCategory(id, body);

    return NextResponse.json({ category });
  } catch (error) {
    logError("/api/admin/categories/[id] PUT", error);

    if (error.message === "Category not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Soft delete category
 */
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteCategory(id);

    return NextResponse.json(result);
  } catch (error) {
    logError("/api/admin/categories/[id] DELETE", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
