import { getCategories } from "@/features/catalog/category.service";
import ProductFormClient from "../ProductFormClient";

export default async function AddProductPage() {
  const categoriesResult = await getCategories({ status: null, limit: 200 });

  return <ProductFormClient initialData={null} categories={categoriesResult.categories} />;
}
