import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
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
        },
      },
    });

    if (!variant || variant.deletedAt) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (variant.stockQuantity <= 0) {
      return NextResponse.json({ error: "Variant out of stock" }, { status: 400 });
    }

    const product = variant.product;
    const primaryImage = product.images?.[0]?.imageUrl || null;

    return NextResponse.json({
      id: variant.id,
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      regularPrice: Number(product.regularPrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      image: primaryImage,
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
    });
  } catch (error) {
    console.error("GET /api/checkout/variant/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
