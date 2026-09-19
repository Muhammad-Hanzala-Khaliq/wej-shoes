import { NextResponse } from "next/server";
import { searchProducts } from "@/features/catalog/product.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Search products (PUBLIC)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({ products: [] });
    }

    const products = await searchProducts(q);
    return NextResponse.json({ products });
  } catch (error) {
    logError("/api/search", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
