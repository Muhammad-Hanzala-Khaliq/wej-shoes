import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/features/catalog/product.service";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import ProductGallery from "@/components/storefront/ProductGallery";
import RelatedProducts from "@/components/storefront/RelatedProducts";
import ProductDetailClient from "./ProductDetailClient";

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

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

function calculateDiscount(regularPrice, salePrice) {
  if (!salePrice || salePrice >= regularPrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
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

  const regularPrice = Number(product.regularPrice);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const hasSale = salePrice && salePrice < regularPrice;
  const discount = hasSale ? calculateDiscount(regularPrice, salePrice) : 0;

  const images = serializedProduct.images || [];
  const variants = serializedProduct.variants || [];

  const optimizedImages = images.map((img) => ({
    ...img,
    imageUrl: img.cloudinaryPublicId
      ? getCloudinaryUrl(img.cloudinaryPublicId, { width: 800, height: 800 })
      : img.imageUrl,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/collections/${product.category.gender.toLowerCase()}`} className="hover:text-gray-700">
          {product.category.gender === "MEN" ? "Men" : "Women"}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/collections/${product.category.slug}`} className="hover:text-gray-700">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        <div>
          <ProductGallery images={optimizedImages} productName={product.name} />
        </div>

        <div className="mt-8 lg:mt-0">
          <div className="mb-2">
            <span className="text-sm text-gray-500">{product.category.name}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            {hasSale ? (
              <>
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(salePrice)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(regularPrice)}
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                  Save {discount}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>

          {product.description && (
            <div className="prose prose-sm text-gray-600 mb-8">
              <p>{product.description}</p>
            </div>
          )}

          <ProductDetailClient
            product={serializedProduct}
            variants={variants}
          />

          <div className="mt-8 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free delivery on orders over PKR 5,000
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Cash on Delivery available
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Easy 7-day returns
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <RelatedProducts
          categoryId={product.categoryId}
          excludeProductId={product.id}
        />
      </div>
    </div>
  );
}
