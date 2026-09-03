"use client";

import { useRouter } from "next/navigation";
import ProductFilters from "@/components/storefront/ProductFilters";

export default function CollectionFilters({
  filters,
  activeFilters,
  currentParams,
}) {
  const router = useRouter();

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams(currentParams);
    params.set("page", "1");

    if (newFilters.minPrice) {
      params.set("minPrice", newFilters.minPrice.toString());
    } else {
      params.delete("minPrice");
    }

    if (newFilters.maxPrice) {
      params.set("maxPrice", newFilters.maxPrice.toString());
    } else {
      params.delete("maxPrice");
    }

    if (newFilters.colors && newFilters.colors.length > 0) {
      params.set("colors", newFilters.colors.join(","));
    } else {
      params.delete("colors");
    }

    if (newFilters.sizes && newFilters.sizes.length > 0) {
      params.set("sizes", newFilters.sizes.join(","));
    } else {
      params.delete("sizes");
    }

    const str = params.toString();
    router.push(str ? `?${str}` : "");
  };

  return (
    <ProductFilters
      filters={filters}
      activeFilters={activeFilters}
      onFilterChange={handleFilterChange}
    />
  );
}
