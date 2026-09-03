import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getShippingRules, updateShippingRule } from "@/features/cms/cms.service";
import prisma from "@/lib/db";

/**
 * GET handler - Get shipping rules (admin only)
 */
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await getShippingRules();
    return NextResponse.json(rules);
  } catch (error) {
    console.error("GET /api/admin/shipping error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch shipping rules" },
      { status: 500 }
    );
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
    const { name, type, amount, freeShippingThreshold, isActive } = body;

    if (!name || !type || amount === undefined) {
      return NextResponse.json(
        { error: "name, type, and amount are required" },
        { status: 400 }
      );
    }

    if (!["FLAT", "WEIGHT", "FREE"].includes(type)) {
      return NextResponse.json(
        { error: "type must be FLAT, WEIGHT, or FREE" },
        { status: 400 }
      );
    }

    const rule = await prisma.shippingRule.create({
      data: {
        name,
        type,
        amount,
        freeShippingThreshold: freeShippingThreshold ?? null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/shipping error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create shipping rule" },
      { status: 500 }
    );
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
    console.error("PUT /api/admin/shipping error:", error);

    if (error.message === "Shipping rule not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update shipping rule" },
      { status: 500 }
    );
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

    const existing = await prisma.shippingRule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Shipping rule not found" }, { status: 404 });
    }

    await prisma.shippingRule.delete({ where: { id } });

    return NextResponse.json({ message: "Shipping rule deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/shipping error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete shipping rule" },
      { status: 500 }
    );
  }
}
