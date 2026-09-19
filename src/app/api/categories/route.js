import { NextResponse } from "next/server";
import { getMenuCategories } from "@/features/catalog/category.service";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    const categories = await getMenuCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    logError("/api/categories", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
