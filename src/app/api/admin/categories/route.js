import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getCategories, createCategory } from "@/features/catalog/category.service";

/**
 * GET handler - Fetch all categories
 * @returns {NextResponse}
 */
export async function GET() {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await getCategories({ status: null });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
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
    console.error("POST /api/admin/categories error:", error);

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
