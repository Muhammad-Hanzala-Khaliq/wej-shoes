import CheckoutClient from "@/components/storefront/CheckoutClient";
import { getCheckoutVariant } from "@/features/catalog/product.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout | HADAIRE FOOTWEAR",
  description: "Complete your HADAIRE FOOTWEAR order with Cash on Delivery payment.",
};

export default async function CheckoutPage({ searchParams }) {
  const sp = await searchParams;
  const isBuyNow = sp.buyNow === "true";
  const variantId = sp.variant;
  const quantity = Math.max(1, parseInt(sp.quantity || "1", 10) || 1);

  let initialBuyNowItem = null;
  let buyNowError = "";

  // Buy Now flow: resolve the product server-side so checkout renders instantly
  // (and fails fast with a friendly message if the variant is gone / out of stock)
  if (isBuyNow && variantId) {
    try {
      const variant = await getCheckoutVariant(variantId);
      initialBuyNowItem = { ...variant, quantity };
    } catch (err) {
      buyNowError =
        err.message === "Variant out of stock"
          ? "This size is out of stock. Please choose another size."
          : "This product is no longer available.";
    }
  }

  return (
    <CheckoutClient
      initialBuyNowItem={initialBuyNowItem}
      buyNowError={buyNowError}
    />
  );
}
