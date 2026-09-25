import OrderDetailClient from "@/components/storefront/OrderDetailClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Details | HADAIRE FOOTWEAR",
  description: "View detailed information about your HADAIRE FOOTWEAR order.",
};

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}
