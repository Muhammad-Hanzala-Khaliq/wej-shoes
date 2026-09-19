export default function AdminLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar spacer */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0" />

      {/* Main content */}
      <div className="flex-1 p-8">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-100 p-5 h-24 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
                  <div className="h-6 bg-gray-100 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="h-5 bg-gray-100 rounded w-32" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-32" />
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-4 bg-gray-100 rounded w-16 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
