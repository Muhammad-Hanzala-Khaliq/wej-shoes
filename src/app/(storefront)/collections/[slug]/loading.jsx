export default function CollectionLoading() {
  return (
    <div className="container-page section">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="flex items-center gap-3">
          <div className="h-10 bg-gray-100 rounded w-32" />
          <div className="h-10 bg-gray-100 rounded w-24" />
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-100 rounded-lg mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
