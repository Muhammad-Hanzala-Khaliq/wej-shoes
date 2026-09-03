import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/features/catalog/product.service";

/**
 * GET handler - Fetch single product by id
 * @param {Request} request
 * @param {Object} params
 * @param {string} params.id
 * @returns {NextResponse}
 */
export async function GET(request, { params }) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Update product
 * @param {Request} request
 * @param {Object} params
 * @param {string} params.id
 * @returns {NextResponse}
 */
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const product = await updateProduct(id, body);

    return NextResponse.json({ product });
  } catch (error) {
    console.error("PUT /api/admin/products/[id] error:", error);

    if (error.message === "Product not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Soft delete product
 * @param {Request} request
 * @param {Object} params
 * @param {string} params.id
 * @returns {NextResponse}
 */
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteProduct(id);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);

    if (error.message === "Product not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
