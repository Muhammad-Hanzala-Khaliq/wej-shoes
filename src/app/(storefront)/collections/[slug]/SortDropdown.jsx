"use client";

import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
];

export default function SortDropdown({ sort, currentParams }) {
  const router = useRouter();

  const buildUrl = (overrides) => {
    const params = new URLSearchParams(currentParams);
    if (overrides.sort) params.set("sort", overrides.sort);
    params.set("page", "1");
    const str = params.toString();
    return str ? `?${str}` : "";
  };

  const handleChange = (value) => {
    router.push(buildUrl({ sort: value }));
  };

  return (
    <select
      defaultValue={sort}
      onChange={(e) => handleChange(e.target.value)}
      className="border rounded-lg px-3 py-2 text-sm bg-white"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
