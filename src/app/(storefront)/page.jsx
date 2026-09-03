import Link from "next/link";
import prisma from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";

async function getCategories() {
  return prisma.category.findMany({
    where: { status: "ACTIVE", deletedAt: null, parentId: null },
    orderBy: { name: "asc" },
  });
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, status: "ACTIVE", deletedAt: null },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true } },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

async function getNewArrivals() {
  return prisma.product.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true } },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

export const metadata = {
  title: "WEJ Shoes - Premium Footwear for Men & Women",
  description:
    "Discover premium footwear for men and women at WEJ Shoes. Quality craftsmanship, modern designs, and unbeatable comfort. Cash on Delivery available across Pakistan.",
};

export default async function HomePage() {
  const [categories, featuredProducts, newArrivals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getNewArrivals(),
  ]);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Step Into Style
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Premium footwear for men and women. Quality craftsmanship, modern designs, and unbeatable comfort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/collections/men"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Shop Men
              </Link>
              <Link
                href="/collections/women"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
              >
                Shop Women
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.gender.toLowerCase()}`}
              className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-center p-4">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-2 ${
                      category.gender === "MEN"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-pink-100 text-pink-800"
                    }`}
                  >
                    {category.gender}
                  </span>
                  <p className="font-medium text-gray-900">{category.name}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              href="/collections/new"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          {featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Featured products coming soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            New Arrivals
          </h2>
          <Link
            href="/collections/new"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All →
          </Link>
        </div>
        {newArrivals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">New arrivals coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Quality You Can Trust
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Every pair is crafted with attention to detail, using premium materials for lasting comfort and style.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white mb-2">Free Delivery</div>
              <p className="text-gray-400 text-sm">On orders over PKR 5,000</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Cash on Delivery</div>
              <p className="text-gray-400 text-sm">Pay when you receive</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Easy Returns</div>
              <p className="text-gray-400 text-sm">7-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
