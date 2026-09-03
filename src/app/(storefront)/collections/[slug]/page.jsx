import Link from "next/link";
import prisma from "@/lib/db";
import { getCollectionProducts, getAvailableFilters } from "@/features/catalog/collection.service";
import ProductGrid from "@/components/storefront/ProductGrid";
import CollectionFilters from "./CollectionFilters";
import SortDropdown from "./SortDropdown";

function serialize(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (typeof value === "object" && value !== null && value.constructor?.name === "Decimal") {
        return value.toString();
      }
      return value;
    })
  );
}

async function getCollectionInfo(slug) {
  if (slug === "men") {
    return { gender: "MEN", title: "Men's Collection", description: "Premium footwear for men" };
  }
  if (slug === "women") {
    return { gender: "WOMEN", title: "Women's Collection", description: "Premium footwear for women" };
  }
  if (slug === "new") {
    return { gender: null, title: "New Arrivals", description: "Latest additions to our collection" };
  }

  const category = await prisma.category.findUnique({
    where: { slug, deletedAt: null },
    select: { name: true, gender: true },
  });

  if (category) {
    return {
      gender: category.gender,
      categorySlug: slug,
      title: category.name,
      description: `Shop ${category.name} footwear`,
    };
  }

  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const info = await getCollectionInfo(slug);

  if (!info) {
    return { title: "Collection Not Found | WEJ Shoes" };
  }

  return {
    title: `${info.title} | WEJ Shoes`,
    description: info.description,
  };
}

export default async function CollectionPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const info = await getCollectionInfo(slug);

  if (!info) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
        <p className="text-gray-500 mb-6">The collection you are looking for does not exist.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const page = parseInt(resolvedSearchParams.page || "1");
  const sort = resolvedSearchParams.sort || "newest";
  const minPrice = resolvedSearchParams.minPrice || null;
  const maxPrice = resolvedSearchParams.maxPrice || null;
  const colors = resolvedSearchParams.colors ? resolvedSearchParams.colors.split(",") : null;
  const sizes = resolvedSearchParams.sizes ? resolvedSearchParams.sizes.split(",") : null;

  const [collectionData, filters] = await Promise.all([
    getCollectionProducts({
      gender: info.gender,
      categorySlug: info.categorySlug || null,
      page,
      limit: 12,
      sort,
      minPrice,
      maxPrice,
      colors,
      sizes,
    }),
    getAvailableFilters(info.gender, info.categorySlug || null),
  ]);

  const serializedProducts = serialize(collectionData.products);
  const serializedFilters = serialize(filters);

  const currentParams = {};
  if (sort && sort !== "newest") currentParams.sort = sort;
  if (minPrice) currentParams.minPrice = minPrice;
  if (maxPrice) currentParams.maxPrice = maxPrice;
  if (colors && colors.length > 0) currentParams.colors = colors.join(",");
  if (sizes && sizes.length > 0) currentParams.sizes = sizes.join(",");

  const buildUrl = (overrides) => {
    const urlParams = new URLSearchParams(currentParams);
    if (overrides.page && overrides.page > 1) urlParams.set("page", overrides.page.toString());
    if (overrides.sort) urlParams.set("sort", overrides.sort);
    if (overrides.minPrice) urlParams.set("minPrice", overrides.minPrice.toString());
    if (overrides.maxPrice) urlParams.set("maxPrice", overrides.maxPrice.toString());
    if (overrides.colors && overrides.colors.length > 0) urlParams.set("colors", overrides.colors.join(","));
    if (overrides.sizes && overrides.sizes.length > 0) urlParams.set("sizes", overrides.sizes.join(","));
    const str = urlParams.toString();
    return str ? `?${str}` : "";
  };

  const activeFilters = {
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
    colors: colors || [],
    sizes: sizes || [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{info.title}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{info.title}</h1>
          <p className="text-gray-500 mt-1">{collectionData.total} products</p>
        </div>

        <div className="hidden md:block">
          <SortDropdown sort={sort} currentParams={currentParams} />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="mb-6 lg:mb-0">
          <CollectionFilters
            filters={serializedFilters}
            activeFilters={activeFilters}
            currentParams={currentParams}
          />
        </aside>

        <div>
          <div className="md:hidden mb-4">
            <SortDropdown sort={sort} currentParams={currentParams} />
          </div>

          <ProductGrid products={serializedProducts} />

          {collectionData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: page - 1, sort, minPrice, maxPrice, colors, sizes })}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}

              {Array.from({ length: collectionData.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (collectionData.totalPages <= 7) return true;
                  if (p === 1 || p === collectionData.totalPages) return true;
                  if (Math.abs(p - page) <= 1) return true;
                  return false;
                })
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <Link
                      key={p}
                      href={buildUrl({ page: p, sort, minPrice, maxPrice, colors, sizes })}
                      className={`px-4 py-2 border rounded-lg text-sm ${
                        p === page
                          ? "bg-gray-900 text-white border-gray-900"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}

              {page < collectionData.totalPages && (
                <Link
                  href={buildUrl({ page: page + 1, sort, minPrice, maxPrice, colors, sizes })}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
