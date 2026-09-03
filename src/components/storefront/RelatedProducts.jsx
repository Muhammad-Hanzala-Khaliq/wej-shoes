import prisma from "@/lib/db";
import ProductCard from "./ProductCard";

function serialize(data) {
  try {
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (value.constructor?.name === "Decimal") {
            return value.toString();
          }
          if (value instanceof Date) {
            return value.toISOString();
          }
        }
        return value;
      })
    );
  } catch (error) {
    console.error("Serialize error:", error);
    return [];
  }
}

async function getRelatedProducts(categoryId, excludeProductId, limit = 4) {
  try {
    return await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: excludeProductId },
        status: "ACTIVE",
        deletedAt: null,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { id: true, imageUrl: true },
        },
        category: {
          select: { name: true },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("getRelatedProducts error:", error);
    return [];
  }
}

export default async function RelatedProducts({ categoryId, excludeProductId, limit = 4 }) {
  const products = await getRelatedProducts(categoryId, excludeProductId, limit);

  if (!products || products.length === 0) return null;

  const serializedProducts = serialize(products);

  if (!serializedProducts || serializedProducts.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-6">You may also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {serializedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
