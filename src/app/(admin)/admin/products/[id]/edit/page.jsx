import { notFound } from "next/navigation";
import { getProductById } from "@/features/catalog/product.service";
import { getCategories } from "@/features/catalog/category.service";
import ProductFormClient from "../../ProductFormClient";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [product, categoriesResult] = await Promise.all([
    getProductById(id),
    getCategories({ status: null, limit: 200 }),
  ]);

  if (!product) {
    notFound();
  }

  const serialized = JSON.parse(JSON.stringify(product));

  return <ProductFormClient initialData={serialized} categories={categoriesResult.categories} />;
}
