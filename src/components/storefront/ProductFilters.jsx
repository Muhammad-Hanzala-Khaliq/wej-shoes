"use client";

import { useState } from "react";

export default function ProductFilters({
  filters,
  activeFilters,
  onFilterChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    minPrice: activeFilters.minPrice || "",
    maxPrice: activeFilters.maxPrice || "",
    colors: activeFilters.colors || [],
    sizes: activeFilters.sizes || [],
  });

  const activeCount =
    (activeFilters.colors?.length || 0) +
    (activeFilters.sizes?.length || 0) +
    (activeFilters.minPrice ? 1 : 0) +
    (activeFilters.maxPrice ? 1 : 0);

  const handleColorToggle = (color) => {
    const current = localFilters.colors;
    const updated = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    setLocalFilters((prev) => ({ ...prev, colors: updated }));
  };

  const handleSizeToggle = (size) => {
    const current = localFilters.sizes;
    const updated = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    setLocalFilters((prev) => ({ ...prev, sizes: updated }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const cleared = { minPrice: "", maxPrice: "", colors: [], sizes: [] };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, minPrice: e.target.value }))
            }
            className="w-full text-sm border rounded-lg px-3 py-2"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
            }
            className="w-full text-sm border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {filters.colors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {filters.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorToggle(color)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  localFilters.colors.includes(color)
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {filters.sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {filters.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  localFilters.sizes.includes(size)
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Apply Filters
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeCount > 0 && (
            <span className="text-sm text-gray-500">{activeCount} active</span>
          )}
        </div>
        {filterContent}
      </div>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">{filterContent}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
