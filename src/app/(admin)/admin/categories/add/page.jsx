import { getCategories } from "@/features/catalog/category.service";
import CategoryFormClient from "../CategoryFormClient";

export default async function AddCategoryPage() {
  const categoriesResult = await getCategories({ status: null, limit: 200 });

  return <CategoryFormClient initialData={null} parentCategories={categoriesResult.categories} />;
}
