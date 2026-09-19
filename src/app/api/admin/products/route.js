import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getProducts, createProduct } from "@/features/catalog/product.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Fetch products with pagination
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

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      status: searchParams.get("status") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      gender: searchParams.get("gender") || undefined,
      search: searchParams.get("search") || undefined,
    };

    if (searchParams.get("isFeatured")) {
      options.isFeatured = searchParams.get("isFeatured") === "true";
    }

    const result = await getProducts(options);

    return NextResponse.json(result);
  } catch (error) {
    logError("GET /api/admin/products", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Create new product
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

    if (!body.name || !body.categoryId || body.regularPrice === undefined) {
      return NextResponse.json(
        { error: "Name, categoryId, and regularPrice are required" },
        { status: 400 }
      );
    }

    const product = await createProduct(body);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    logError("POST /api/admin/products", error);

    if (error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
