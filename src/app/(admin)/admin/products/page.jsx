import { getProducts } from "@/features/catalog/product.service";
import { getCategories } from "@/features/catalog/category.service";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const categoryId = params.categoryId || "";
  const status = params.status || "";
  const gender = params.gender || "";

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({ page, limit: 20, search: search || undefined, categoryId: categoryId || undefined, status: status || undefined, gender: gender || undefined }),
    getCategories({ status: null, limit: 200, includeDeleted: false }),
  ]);

  const products = JSON.parse(JSON.stringify(productsResult.products));
  const categories = JSON.parse(JSON.stringify(categoriesResult.categories));

  return (
    <ProductsClient
      initialProducts={products}
      initialTotal={productsResult.total}
      initialPage={productsResult.page}
      initialTotalPages={productsResult.totalPages}
      categories={categories}
    />
  );
}
