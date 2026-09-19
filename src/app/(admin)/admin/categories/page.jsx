import { getCategories } from "@/features/catalog/category.service";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await getCategories({ page, limit: 20, status: null });

  return (
    <CategoriesClient
      initialCategories={result.categories}
      initialTotal={result.total}
      initialPage={result.page}
      initialTotalPages={result.totalPages}
    />
  );
}
