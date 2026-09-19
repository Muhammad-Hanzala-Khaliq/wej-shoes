import { notFound } from "next/navigation";
import { getCategoryById, getCategories } from "@/features/catalog/category.service";
import CategoryFormClient from "../../CategoryFormClient";

export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  const [category, categoriesResult] = await Promise.all([
    getCategoryById(id),
    getCategories({ status: null, limit: 200 }),
  ]);

  if (!category) {
    notFound();
  }

  const serialized = JSON.parse(JSON.stringify(category));

  return <CategoryFormClient initialData={serialized} parentCategories={categoriesResult.categories} />;
}
