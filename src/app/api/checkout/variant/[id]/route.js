import { NextResponse } from "next/server";
import { getCheckoutVariant } from "@/features/catalog/product.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get variant for checkout (PUBLIC)
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const variant = await getCheckoutVariant(id);
    return NextResponse.json(variant);
  } catch (error) {
    logError("/api/checkout/variant/[id]", error);

    if (error.message === "Variant not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message === "Variant out of stock") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
