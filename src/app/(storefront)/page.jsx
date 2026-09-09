import Link from "next/link";
import prisma from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import CategoryCarousel from "@/components/storefront/CategoryCarousel";

function serializeDecimal(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (
        typeof value === "object" &&
        value !== null &&
        value.constructor?.name === "Decimal"
      ) {
        return value.toString();
      }
      return value;
    }),
  );
}

function heroUrl(url, width) {
  if (!url || !url.includes("cloudinary")) return url;
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}

async function getHeroContent() {
  const hero = await prisma.homepageContent.findFirst({
    where: { sectionType: "HERO", isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return hero;
}

async function getCategories() {
  return prisma.category.findMany({
    where: { status: "ACTIVE", deletedAt: null, parentId: { not: null } },
    include: {
      products: {
        where: { status: "ACTIVE", deletedAt: null },
        take: 1,
        select: {
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { imageUrl: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, status: "ACTIVE", deletedAt: null },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, isPrimary: true },
      },
      category: { select: { name: true } },
      variants: {
        where: { deletedAt: null, status: "ACTIVE" },
        select: { id: true, size: true, stockQuantity: true },
      },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

async function getNewArrivals() {
  return prisma.product.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, isPrimary: true },
      },
      category: { select: { name: true } },
      variants: {
        where: { deletedAt: null, status: "ACTIVE" },
        select: { id: true, size: true, stockQuantity: true },
      },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

async function getGenderImage(gender) {
  const product = await prisma.product.findFirst({
    where: { status: "ACTIVE", deletedAt: null, category: { gender } },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { imageUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return product?.images?.[0]?.imageUrl || null;
}

export const metadata = {
  title: "WEJ Shoes - Premium Footwear for Men & Women",
  description:
    "Discover premium footwear for men and women at WEJ Shoes. Quality craftsmanship, modern designs, and unbeatable comfort. Cash on Delivery available across Pakistan.",
};

export default async function HomePage() {
  const [
    heroContent,
    categories,
    featuredProducts,
    newArrivals,
    menImage,
    womenImage,
  ] = await Promise.all([
    getHeroContent(),
    getCategories(),
    getFeaturedProducts(),
    getNewArrivals(),
    getGenderImage("MEN"),
    getGenderImage("WOMEN"),
  ]);

  const serializedFeatured = serializeDecimal(featuredProducts);
  const serializedNew = serializeDecimal(newArrivals);

  const childCategories = categories.map((cat) => ({
    ...cat,
    displayImage:
      cat.imageUrl ||
      cat.products?.[0]?.images?.[0]?.imageUrl ||
      null,
  }));

  const heroImageUrl = heroContent?.imageUrl || null;
  const heroTitle = heroContent?.title || "MAKE 'EM STARE.";
  const heroSubtitle =
    heroContent?.subtitle ||
    "Premium footwear crafted for comfort and confidence.";

  return (
    <div>
      {/* SECTION 1: HERO */}
      <section className="relative w-full h-[calc(100svh-4rem)] min-h-[480px] overflow-hidden">
        <div className="absolute inset-0">
          {heroImageUrl ? (
            <img
              src={heroUrl(heroImageUrl, 1920)}
              srcSet={[640, 1024, 1600, 2000].map((w) => `${heroUrl(heroImageUrl, w)} ${w}w`).join(", ")}
              sizes="100vw"
              alt={heroTitle}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: "var(--surface-soft)" }}
            />
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="absolute bottom-0 left-0 w-full">
            <div className="container-page pb-12 md:pb-20">
              <h1 className="heading-xl mb-4" style={{ color: "#fff" }}>
                {heroTitle}
              </h1>
              <p
                className="text-base md:text-lg mb-8 max-w-xl"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {heroSubtitle}
              </p>
              <Link href="/collections/new" className="btn-white">
                SHOP THE DROP →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SHOP BY CATEGORY */}
      <section className="container-page section">
        <h2
          className="heading-lg mb-10 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          SHOP BY CATEGORY
        </h2>
        <CategoryCarousel categories={childCategories} />
      </section>

      {/* SECTION 3: PREMIUM (Featured Products) */}
      <section style={{ background: "var(--surface-soft)" }}>
        <div className="container-page section">
          <h2
            className="heading-lg mb-10 text-center"
            style={{ color: "var(--text-primary)" }}
          >
            PREMIUM
          </h2>
          {serializedFeatured.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: "var(--text-muted)" }}>
                Featured products coming soon
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {serializedFeatured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: MEN & WOMEN SPLIT - BEYOND TRENDS */}
      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Men */}
          <div className="relative h-[420px] md:h-[560px] overflow-hidden">
            {menImage ? (
              <img
                src={menImage}
                alt="Men's Collection"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: "var(--surface-soft)" }}
              />
            )}
          </div>

          {/* Women */}
          <div className="relative h-[420px] md:h-[560px] overflow-hidden">
            {womenImage ? (
              <img
                src={womenImage}
                alt="Women's Collection"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: "var(--surface-soft)" }}
              />
            )}
          </div>
        </div>

        {/* Centered overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-6 pointer-events-auto">
            <h2
              className="heading-xl mb-3"
              style={{
                color: "#fff",
                textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              }}
            >
              BEYOND TRENDS
            </h2>
            <p
              className="text-sm md:text-base mb-8"
              style={{
                color: "rgba(255,255,255,0.9)",
                textShadow: "0 1px 10px rgba(0,0,0,0.3)",
              }}
            >
              Always in style, always in vogue
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/collections/men" className="btn-white">
                SHOP MEN
              </Link>
              <Link href="/collections/women" className="btn-white-outline">
                SHOP WOMEN
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: NEW ARRIVALS */}
      <section className="container-page section">
        <div className="flex items-center justify-between mb-10">
          <h2 className="heading-lg" style={{ color: "var(--text-primary)" }}>
            NEW ARRIVALS
          </h2>
          <Link href="/collections/new" className="link text-sm">
            View All →
          </Link>
        </div>
        {serializedNew.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: "var(--text-muted)" }}>
              New arrivals coming soon
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {serializedNew.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
