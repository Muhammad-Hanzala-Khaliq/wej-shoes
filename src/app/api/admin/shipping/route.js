import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getShippingRules, createShippingRule, updateShippingRule, deleteShippingRule } from "@/features/cms/cms.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get shipping rules with pagination (admin only)
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

    const allRules = await getShippingRules();
    const total = allRules.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;
    const items = allRules.slice(skip, skip + limit);

    return NextResponse.json({ items, total, totalPages, page });
  } catch (error) {
    logError("GET /api/admin/shipping", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST handler - Create new shipping rule (admin only)
 */
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rule = await createShippingRule(body);
    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    logError("POST /api/admin/shipping", error);

    if (error.message === "name, type, and amount are required" || error.message === "type must be FLAT, WEIGHT, or FREE") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT handler - Update shipping rule (admin only)
 */
export async function PUT(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const rule = await updateShippingRule(id, data);
    return NextResponse.json(rule);
  } catch (error) {
    logError("PUT /api/admin/shipping", error);

    if (error.message === "Shipping rule not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE handler - Delete shipping rule (admin only)
 */
export async function DELETE(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    const result = await deleteShippingRule(id);
    return NextResponse.json(result);
  } catch (error) {
    logError("DELETE /api/admin/shipping", error);

    if (error.message === "Shipping rule not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
