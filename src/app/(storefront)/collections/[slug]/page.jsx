import Link from "next/link";
import prisma from "@/lib/db";
import { getCollectionProducts, getAvailableFilters } from "@/features/catalog/collection.service";
import ProductGrid from "@/components/storefront/ProductGrid";
import CollectionToolbar from "@/components/storefront/CollectionToolbar";

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
    return { gender: "MEN", title: "Men", description: "Premium footwear for men" };
  }
  if (slug === "women") {
    return { gender: "WOMEN", title: "Women", description: "Premium footwear for women" };
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
      title: category.name.toUpperCase(),
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
      <div className="container-page py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-light uppercase tracking-wide mb-4" style={{ color: "var(--text-primary)" }}>
          Not Found
        </h1>
        <p className="mb-8" style={{ color: "var(--text-muted)" }}>
          The collection you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 text-sm font-medium transition-colors"
          style={{ background: "var(--text-primary)", color: "var(--surface)" }}
        >
          Back to Home
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
  const inStock = resolvedSearchParams.inStock === "1";
  const viewMode = resolvedSearchParams.view || "grid";

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
      inStock,
    }),
    getAvailableFilters(info.gender, info.categorySlug || null),
  ]);

  const serializedProducts = serialize(collectionData.products);
  const serializedFilters = serialize(filters);

  const activeFilters = {
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
    colors: colors || [],
    sizes: sizes || [],
    inStock: resolvedSearchParams.inStock === "1",
  };

  function buildPaginationUrl(overrides) {
    const params = new URLSearchParams();
    if (overrides.page && overrides.page > 1) params.set("page", overrides.page.toString());
    if (sort && sort !== "newest") params.set("sort", sort);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (colors && colors.length > 0) params.set("colors", colors.join(","));
    if (sizes && sizes.length > 0) params.set("sizes", sizes.join(","));
    if (inStock) params.set("inStock", "1");
    if (viewMode !== "grid") params.set("view", viewMode);
    const str = params.toString();
    return str ? `?${str}` : "";
  }

  return (
    <div className="container-page py-10 md:py-16">
      {/* Title */}
      <h1
        className="text-4xl md:text-6xl font-light uppercase tracking-wide mb-10"
        style={{ color: "var(--text-primary)" }}
      >
        {info.title}
      </h1>

      {/* Toolbar */}
      <div className="mb-10">
        <CollectionToolbar
          filters={serializedFilters}
          activeFilters={activeFilters}
          sort={sort}
          total={collectionData.total}
          viewMode={viewMode}
        />
      </div>

      {/* Product grid */}
      <ProductGrid products={serializedProducts} viewMode={viewMode} />

      {/* Pagination */}
      {collectionData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {page > 1 && (
            <Link
              href={buildPaginationUrl({ page: page - 1 })}
              className="px-3 py-1.5 text-sm transition-colors hover:opacity-70"
              style={{ color: "var(--text-secondary)" }}
            >
              ← Prev
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
                <span key={`dots-${i}`} className="px-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  …
                </span>
              ) : (
                <Link
                  key={p}
                  href={buildPaginationUrl({ page: p })}
                  className="w-9 h-9 flex items-center justify-center text-sm rounded transition-colors"
                  style={{
                    background: p === page ? "var(--text-primary)" : "transparent",
                    color: p === page ? "var(--surface)" : "var(--text-secondary)",
                  }}
                >
                  {p}
                </Link>
              )
            )}

          {page < collectionData.totalPages && (
            <Link
              href={buildPaginationUrl({ page: page + 1 })}
              className="px-3 py-1.5 text-sm transition-colors hover:opacity-70"
              style={{ color: "var(--text-secondary)" }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
