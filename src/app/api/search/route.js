import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
        ],
      },
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        regularPrice: true,
        salePrice: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      regularPrice: Number(p.regularPrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      imageUrl: p.images[0]?.imageUrl || null,
    }));

    return NextResponse.json({ products: formatted });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
