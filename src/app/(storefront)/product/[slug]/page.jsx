import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/features/catalog/product.service";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import ProductGallery from "@/components/storefront/ProductGallery";
import RelatedProducts from "@/components/storefront/RelatedProducts";
import ProductInfoPanel from "@/components/storefront/ProductInfoPanel";

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
    return { title: "Product | WEJ Shoes" };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
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

  const optimizedImages = images.map((img) => ({
    ...img,
    imageUrl: img.cloudinaryPublicId
      ? getCloudinaryUrl(img.cloudinaryPublicId, { width: 800, height: 800 })
      : img.imageUrl,
  }));

  return (
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
          <ProductInfoPanel product={serializedProduct} variants={variants} />
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
  );
}
