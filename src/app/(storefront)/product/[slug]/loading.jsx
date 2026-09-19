export default function ProductLoading() {
  return (
    <div className="container-page section">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery skeleton */}
        <div className="animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-lg" />
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-16 h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>

        {/* Info panel skeleton */}
        <div className="space-y-6 animate-pulse">
          <div>
            <div className="h-8 bg-gray-100 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
          </div>
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="h-10 bg-gray-100 rounded w-1/4" />
          <div>
            <div className="h-4 bg-gray-100 rounded w-20 mb-3" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-14 h-14 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="h-4 bg-gray-100 rounded w-16" />
          <div className="h-12 bg-gray-100 rounded-full" />
          <div className="h-12 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}
