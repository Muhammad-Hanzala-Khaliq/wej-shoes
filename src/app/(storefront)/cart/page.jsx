import CartClient from "@/components/storefront/CartClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cart | HADAIRE FOOTWEAR",
  description: "Review your shopping cart and proceed to checkout.",
};

export default function CartPage() {
  return <CartClient />;
}
