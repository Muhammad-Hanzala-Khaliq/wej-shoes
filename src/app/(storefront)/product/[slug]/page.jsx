import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProductSlugs } from "@/features/catalog/product.service";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { logError } from "@/lib/logger";
import ProductGallery from "@/components/storefront/ProductGallery";
import RelatedProducts from "@/components/storefront/RelatedProducts";
import ProductInfoPanel from "@/components/storefront/ProductInfoPanel";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

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
    logError("product:serialize", error, { slug: "unknown" });
    return null;
  }
}

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return { title: "Product Not Found | WEJ Shoes" };
    }

    const description = product.description
      ? product.description.substring(0, 160)
      : `Shop ${product.name} at WEJ Shoes. Premium footwear with Cash on Delivery available.`;

    const images = product.images || [];

    return {
      title: `${product.name} | WEJ Shoes`,
      description,
      alternates: {
        canonical: `/product/${slug}`,
      },
      openGraph: {
        title: product.name,
        description,
        images: images.slice(0, 3).map((img) => ({
          url: img.imageUrl,
          alt: img.altText || product.name,
        })),
      },
    };
  } catch (error) {
    logError("product:generateMetadata", error, { slug });
    return { title: "Product | WEJ Shoes" };
  }
}

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params;
  const { variant: variantIdFromUrl } = await searchParams;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const serializedProduct = serialize(product);

  if (!serializedProduct) {
    notFound();
  }

  const images = serializedProduct.images || [];
  const variants = serializedProduct.variants || [];

  const firstVariant = variants[0] || null;

  // Use URL variant if provided and valid, else first variant
  const initialVariant = variantIdFromUrl
    ? variants.find((v) => v.id === variantIdFromUrl) || firstVariant
    : firstVariant;

  const optimizedImages = images.map((img) => ({
    ...img,
    imageUrl: img.cloudinaryPublicId
      ? getCloudinaryUrl(img.cloudinaryPublicId, { width: 800, height: 800 })
      : img.imageUrl,
  }));

  const price = variants[0]?.salePrice
    ? Number(variants[0].salePrice)
    : Number(product.regularPrice);
  const inStock = variants.some((v) => v.stockQuantity > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `Shop ${product.name} at WEJ Shoes`,
    image: images.slice(0, 3).map((img) => img.imageUrl),
    brand: { "@type": "Brand", name: "WEJ Shoes" },
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-page py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs mb-6 md:mb-8" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="link" style={{ color: "var(--text-muted)" }}>
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/collections/${product.category.gender.toLowerCase()}`}
            className="link"
            style={{ color: "var(--text-muted)" }}
          >
            {product.category.gender === "MEN" ? "Men" : "Women"}
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/collections/${product.category.slug}`}
            className="link"
            style={{ color: "var(--text-muted)" }}
          >
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Left - Gallery */}
          <div>
            <ProductGallery images={optimizedImages} productName={product.name} />
          </div>

          {/* Right - Info */}
          <div>
            <ProductInfoPanel
              product={serializedProduct}
              variants={variants}
              initialVariant={initialVariant}
            />
          </div>
        </div>

        {/* Related products */}
        <div className="mt-16 md:mt-20 pt-8 md:pt-10" style={{ borderTop: "1px solid var(--border)" }}>
          <RelatedProducts
            categoryId={product.categoryId}
            excludeProductId={product.id}
          />
        </div>
      </div>
    </>
  );
}
