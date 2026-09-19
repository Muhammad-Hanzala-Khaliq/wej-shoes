import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getCategories, createCategory } from "@/features/catalog/category.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Fetch all categories with pagination
 * @param {Request} request
 * @returns {NextResponse}
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

    const result = await getCategories({ status: null, limit, page });

    return NextResponse.json(result);
  } catch (error) {
    logError("/api/admin/categories", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Create new category
 * @param {Request} request
 * @returns {NextResponse}
 */
export async function POST(request) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || !body.gender) {
      return NextResponse.json(
        { error: "Name and gender are required" },
        { status: 400 }
      );
    }

    const category = await createCategory(body);

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    logError("/api/admin/categories POST", error);

    if (error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error.message.includes("required") || error.message.includes("Gender")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
