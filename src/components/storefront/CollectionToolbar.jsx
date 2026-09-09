"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
];

function FilterPopover({ label, isOpen, onToggle, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-sm transition-colors"
        style={{
          color: isOpen ? "var(--text-primary)" : "var(--text-secondary)",
          fontWeight: isOpen ? 600 : 400,
        }}
      >
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-2 p-4 min-w-[260px] z-40"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", borderRadius: "0.5rem" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function AvailabilityContent({ filters, staged, onStageChange }) {
  const hasColors = filters.colors && filters.colors.length > 0;
  const hasSizes = filters.sizes && filters.sizes.length > 0;

  return (
    <div className="max-h-80 overflow-y-auto space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Availability</p>
        <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--text-secondary)" }}>
          <input
            type="checkbox"
            checked={staged.inStock}
            onChange={(e) => onStageChange({ ...staged, inStock: e.target.checked })}
            className="rounded"
          />
          In stock only
        </label>
      </div>

      {hasColors && (
        <>
          <div className="border-t" style={{ borderColor: "var(--border)" }} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Color</p>
            <div className="space-y-1.5">
              {filters.colors.map((color) => (
                <label key={color} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--text-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={staged.colors.includes(color)}
                    onChange={() => {
                      const next = staged.colors.includes(color)
                        ? staged.colors.filter((c) => c !== color)
                        : [...staged.colors, color];
                      onStageChange({ ...staged, colors: next });
                    }}
                    className="rounded"
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {hasSizes && (
        <>
          <div className="border-t" style={{ borderColor: "var(--border)" }} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Size</p>
            <div className="space-y-1.5">
              {filters.sizes.map((size) => (
                <label key={size} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--text-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={staged.sizes.includes(size)}
                    onChange={() => {
                      const next = staged.sizes.includes(size)
                        ? staged.sizes.filter((s) => s !== size)
                        : [...staged.sizes, size];
                      onStageChange({ ...staged, sizes: next });
                    }}
                    className="rounded"
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PriceContent({ staged, onStageChange }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Price</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          value={staged.minPrice}
          onChange={(e) => onStageChange({ ...staged, minPrice: e.target.value })}
          className="w-full border rounded px-2 py-1.5 text-sm"
          style={{ borderColor: "var(--border)" }}
        />
        <span style={{ color: "var(--text-muted)" }}>-</span>
        <input
          type="number"
          placeholder="Max"
          value={staged.maxPrice}
          onChange={(e) => onStageChange({ ...staged, maxPrice: e.target.value })}
          className="w-full border rounded px-2 py-1.5 text-sm"
          style={{ borderColor: "var(--border)" }}
        />
      </div>
    </div>
  );
}

export default function CollectionToolbar({
  filters,
  activeFilters,
  sort,
  total,
  viewMode,
  onParamsChange,
}) {
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Staged states for each popover
  const [availStaged, setAvailStaged] = useState({ inStock: false, colors: [], sizes: [] });
  const [priceStaged, setPriceStaged] = useState({ minPrice: "", maxPrice: "" });

  // Mobile staged
  const [mobileStaged, setMobileStaged] = useState({ inStock: false, colors: [], sizes: [], minPrice: "", maxPrice: "" });

  function buildUrl(overrides) {
    const params = new URLSearchParams();
    if (overrides.page && overrides.page > 1) params.set("page", overrides.page.toString());
    if (overrides.sort) params.set("sort", overrides.sort);
    if (overrides.minPrice) params.set("minPrice", overrides.minPrice.toString());
    if (overrides.maxPrice) params.set("maxPrice", overrides.maxPrice.toString());
    if (overrides.colors && overrides.colors.length > 0) params.set("colors", overrides.colors.join(","));
    if (overrides.sizes && overrides.sizes.length > 0) params.set("sizes", overrides.sizes.join(","));
    if (overrides.view) params.set("view", overrides.view);
    if (overrides.inStock) params.set("inStock", "1");
    const str = params.toString();
    router.push(str ? `?${str}` : "");
  }

  function handleSortChange(value) {
    buildUrl({ sort: value, page: 1 });
  }

  function handleViewChange(mode) {
    buildUrl({ view: mode, page: 1 });
  }

  // Initialize staged from activeFilters when popover opens
  function openAvailPopover() {
    setAvailStaged({
      inStock: activeFilters.inStock || false,
      colors: activeFilters.colors || [],
      sizes: activeFilters.sizes || [],
    });
    setOpenPopover("availability");
  }

  function openPricePopover() {
    setPriceStaged({
      minPrice: activeFilters.minPrice || "",
      maxPrice: activeFilters.maxPrice || "",
    });
    setOpenPopover("price");
  }

  function handleAvailApply() {
    buildUrl({
      page: 1,
      sort,
      minPrice: activeFilters.minPrice,
      maxPrice: activeFilters.maxPrice,
      colors: availStaged.colors,
      sizes: availStaged.sizes,
      view: viewMode,
      inStock: availStaged.inStock,
    });
    setOpenPopover(null);
  }

  function handleAvailClear() {
    setAvailStaged({ inStock: false, colors: [], sizes: [] });
    buildUrl({
      page: 1,
      sort,
      minPrice: activeFilters.minPrice,
      maxPrice: activeFilters.maxPrice,
      colors: [],
      sizes: [],
      view: viewMode,
      inStock: false,
    });
    setOpenPopover(null);
  }

  function handlePriceApply() {
    buildUrl({
      page: 1,
      sort,
      minPrice: priceStaged.minPrice,
      maxPrice: priceStaged.maxPrice,
      colors: activeFilters.colors,
      sizes: activeFilters.sizes,
      view: viewMode,
      inStock: activeFilters.inStock,
    });
    setOpenPopover(null);
  }

  function handlePriceClear() {
    setPriceStaged({ minPrice: "", maxPrice: "" });
    buildUrl({
      page: 1,
      sort,
      minPrice: "",
      maxPrice: "",
      colors: activeFilters.colors,
      sizes: activeFilters.sizes,
      view: viewMode,
      inStock: activeFilters.inStock,
    });
    setOpenPopover(null);
  }

  function handleMobileApply() {
    buildUrl({
      page: 1,
      sort,
      minPrice: mobileStaged.minPrice,
      maxPrice: mobileStaged.maxPrice,
      colors: mobileStaged.colors,
      sizes: mobileStaged.sizes,
      view: viewMode,
      inStock: mobileStaged.inStock,
    });
    setMobileDrawerOpen(false);
  }

  function handleMobileClear() {
    setMobileStaged({ inStock: false, colors: [], sizes: [], minPrice: "", maxPrice: "" });
    buildUrl({
      page: 1,
      sort,
      colors: [],
      sizes: [],
      view: viewMode,
      inStock: false,
    });
    setMobileDrawerOpen(false);
  }

  function openMobileDrawer() {
    setMobileStaged({
      inStock: activeFilters.inStock || false,
      colors: activeFilters.colors || [],
      sizes: activeFilters.sizes || [],
      minPrice: activeFilters.minPrice || "",
      maxPrice: activeFilters.maxPrice || "",
    });
    setMobileDrawerOpen(true);
  }

  const hasAvailActive = activeFilters.inStock || (activeFilters.colors?.length > 0) || (activeFilters.sizes?.length > 0);
  const hasPriceActive = activeFilters.minPrice || activeFilters.maxPrice;
  const hasAnyActive = hasAvailActive || hasPriceActive;

  const availCount = (activeFilters.inStock ? 1 : 0) + (activeFilters.colors?.length || 0) + (activeFilters.sizes?.length || 0);
  const priceCount = (activeFilters.minPrice ? 1 : 0) + (activeFilters.maxPrice ? 1 : 0);

  const availLabel = hasAvailActive
    ? `Availability ${availCount > 0 ? `(${availCount})` : ""}`
    : "Availability";
  const priceLabel = hasPriceActive
    ? `Price ${priceCount > 0 ? `(${priceCount})` : ""}`
    : "Price";

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left: Filter buttons (desktop) */}
        <div className="hidden md:flex items-center gap-5">
          <FilterPopover
            label={availLabel}
            isOpen={openPopover === "availability"}
            onToggle={openPopover === "availability" ? () => setOpenPopover(null) : openAvailPopover}
            onClose={() => setOpenPopover(null)}
          >
            <AvailabilityContent filters={filters} staged={availStaged} onStageChange={setAvailStaged} />
            <div className="border-t mt-4 pt-3 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={handleAvailApply}
                className="px-4 py-1.5 text-xs font-medium rounded-full transition-colors"
                style={{ background: "var(--text-primary)", color: "var(--surface)" }}
              >
                Apply
              </button>
              <button
                onClick={handleAvailClear}
                className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Clear
              </button>
            </div>
          </FilterPopover>

          <FilterPopover
            label={priceLabel}
            isOpen={openPopover === "price"}
            onToggle={openPopover === "price" ? () => setOpenPopover(null) : openPricePopover}
            onClose={() => setOpenPopover(null)}
          >
            <PriceContent staged={priceStaged} onStageChange={setPriceStaged} />
            <div className="border-t mt-4 pt-3 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={handlePriceApply}
                className="px-4 py-1.5 text-xs font-medium rounded-full transition-colors"
                style={{ background: "var(--text-primary)", color: "var(--surface)" }}
              >
                Apply
              </button>
              <button
                onClick={handlePriceClear}
                className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Clear
              </button>
            </div>
          </FilterPopover>
        </div>

        {/* Mobile: Filters button */}
        <button
          onClick={openMobileDrawer}
          className="md:hidden flex items-center gap-1.5 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasAnyActive && (
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--brand)" }} />
          )}
        </button>

        {/* Right: count, sort, view toggle */}
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {total} {total === 1 ? "item" : "items"}
          </span>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm appearance-none pr-6 bg-transparent cursor-pointer"
              style={{ color: "var(--text-secondary)", border: "none", outline: "none" }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <svg className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleViewChange("grid")}
              className="p-1.5 rounded transition-colors"
              style={{ color: viewMode === "list" ? "var(--text-muted)" : "var(--text-primary)" }}
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
            </button>
            <button
              onClick={() => handleViewChange("list")}
              className="p-1.5 rounded transition-colors"
              style={{ color: viewMode === "list" ? "var(--text-primary)" : "var(--text-muted)" }}
              aria-label="List view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileDrawerOpen(false)} />
          <div
            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto flex flex-col"
            style={{ background: "var(--surface)" }}
          >
            <div className="flex items-center justify-between p-5 pb-0">
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Filters</p>
              <button onClick={() => setMobileDrawerOpen(false)} style={{ color: "var(--text-secondary)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Availability */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Availability</p>
                <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--text-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={mobileStaged.inStock}
                    onChange={(e) => setMobileStaged({ ...mobileStaged, inStock: e.target.checked })}
                    className="rounded"
                  />
                  In stock only
                </label>
              </div>

              {/* Price */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Price</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={mobileStaged.minPrice}
                    onChange={(e) => setMobileStaged({ ...mobileStaged, minPrice: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <span style={{ color: "var(--text-muted)" }}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={mobileStaged.maxPrice}
                    onChange={(e) => setMobileStaged({ ...mobileStaged, maxPrice: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>

              {/* Colors */}
              {filters.colors && filters.colors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Color</p>
                  <div className="space-y-1.5">
                    {filters.colors.map((color) => (
                      <label key={color} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--text-secondary)" }}>
                        <input
                          type="checkbox"
                          checked={mobileStaged.colors.includes(color)}
                          onChange={() => {
                            const next = mobileStaged.colors.includes(color)
                              ? mobileStaged.colors.filter((c) => c !== color)
                              : [...mobileStaged.colors, color];
                            setMobileStaged({ ...mobileStaged, colors: next });
                          }}
                          className="rounded"
                        />
                        {color}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {filters.sizes && filters.sizes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Size</p>
                  <div className="space-y-1.5">
                    {filters.sizes.map((size) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--text-secondary)" }}>
                        <input
                          type="checkbox"
                          checked={mobileStaged.sizes.includes(size)}
                          onChange={() => {
                            const next = mobileStaged.sizes.includes(size)
                              ? mobileStaged.sizes.filter((s) => s !== size)
                              : [...mobileStaged.sizes, size];
                            setMobileStaged({ ...mobileStaged, sizes: next });
                          }}
                          className="rounded"
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-5 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={handleMobileApply}
                className="flex-1 px-4 py-2 text-xs font-medium rounded-full transition-colors"
                style={{ background: "var(--text-primary)", color: "var(--surface)" }}
              >
                Apply
              </button>
              <button
                onClick={handleMobileClear}
                className="px-4 py-2 text-xs font-medium rounded-full transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
