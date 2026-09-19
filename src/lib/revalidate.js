import { revalidatePath } from "next/cache";
import { logError } from "@/lib/logger";

export function revalidateProduct(slug) {
  try {
    revalidatePath(`/product/${slug}`);
  } catch (error) {
    logError("revalidate:product", error, { slug });
  }
}

export function revalidateCatalog() {
  try {
    revalidatePath("/collections", "layout");
    revalidatePath("/");
  } catch (error) {
    logError("revalidate:catalog", error);
  }
}

export function revalidateHome() {
  try {
    revalidatePath("/");
  } catch (error) {
    logError("revalidate:home", error);
  }
}

export function revalidateSitemap() {
  try {
    revalidatePath("/sitemap.xml");
  } catch (error) {
    logError("revalidate:sitemap", error);
  }
}
