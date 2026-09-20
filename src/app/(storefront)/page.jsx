import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/storefront/ProductCard";
import CategoryCarousel from "@/components/storefront/CategoryCarousel";
import {
  getHeroContent,
  getHomepageCategories,
  getFeaturedProducts,
  getNewArrivals,
} from "@/features/cms/homepage.service";
import { getCloudinaryUrl } from "@/lib/cloudinary";

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

export const metadata = {
  title: "WEJ Shoes - Premium Footwear for Men, Women & Kids",
  description:
    "Discover premium footwear for men, women, and kids at WEJ Shoes. Quality craftsmanship, modern designs, and unbeatable comfort. Cash on Delivery available across Pakistan.",
};

export default async function HomePage() {
  const [heroContent, childCategories, featuredProducts, newArrivals] =
    await Promise.all([
      getHeroContent(),
      getHomepageCategories(),
      getFeaturedProducts(),
      getNewArrivals(),
    ]);

  const serializedFeatured = serializeDecimal(featuredProducts);
  const serializedNew = serializeDecimal(newArrivals);

  const heroImageUrl = heroContent?.imageUrl || null;
  const heroTitle = heroContent?.title || "MAKE 'EM STARE.";
  const heroSubtitle =
    heroContent?.subtitle ||
    "Premium footwear crafted for comfort and confidence.";

  // Optimize hero image source — max 1920px wide for next/image
  const heroSrc = heroImageUrl
    ? getCloudinaryUrl(heroImageUrl, { width: 1920, height: 1080 })
    : null;

  return (
    <div>
      {/* SECTION 1: HERO — priority for LCP */}
      <section className="relative w-full h-[calc(100svh-4rem)] min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt={heroTitle}
              fill
              priority
              sizes="100vw"
              className="absolute inset-0 object-cover object-center"
              quality={85}
            />
          ) : (
            <div className="w-full h-full" style={{ background: "var(--ink)" }} />
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
      <section>
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

      {/* SECTION 4: BEYOND TRENDS */}
      <section className="relative h-[calc(100svh-4rem)] min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Men */}
          <div className="relative overflow-hidden">
            <Image
              src="/beyond-the-trend-1.jpg"
              alt="Men's Collection"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              quality={80}
            />
          </div>

          {/* Women */}
          <div className="relative overflow-hidden">
            <Image
              src="/beyond-the-trend-2.jpg"
              alt="Women's Collection"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              quality={80}
            />
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
