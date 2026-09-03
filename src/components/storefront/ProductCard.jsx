import Link from "next/link";

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

export default function ProductCard({ product }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.regularPrice);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {hasSale && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </span>
          )}
        </div>
        <div className="p-3">
          {product.category && (
            <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
          )}
          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="mt-2">
            {hasSale ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-red-600">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
