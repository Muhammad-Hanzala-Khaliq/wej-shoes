import Link from "next/link";
import PageHero from "@/components/storefront/PageHero";
import ProductCard from "@/components/storefront/ProductCard";
import { getSaleProducts } from "@/features/cms/homepage.service";

export const dynamic = "force-static";

export const metadata = {
  title: "Sale | WEJ Shoes",
  description:
    "Grab discounted footwear at WEJ Shoes. Limited time offers on premium shoes.",
};

export default async function SalePage() {
  let products = [];
  try {
    const raw = await getSaleProducts(48);
    products = JSON.parse(JSON.stringify(raw));
  } catch {
    // ignore
  }

  return (
    <div>
      <PageHero
        eyebrow="Limited Time"
        title="Sale"
        subtitle="Don't miss out on our discounted styles. Grab your favorites before they're gone."
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">
              No sale items available right now.
            </p>
            <Link
              href="/collections/men"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
