import { NextResponse } from "next/server";
import { getMenuCategories } from "@/features/catalog/category.service";

export async function GET() {
  try {
    const categories = await getMenuCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
