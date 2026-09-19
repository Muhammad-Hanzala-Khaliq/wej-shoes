import OrderDetailClient from "@/components/storefront/OrderDetailClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Details | WEJ Shoes",
  description: "View detailed information about your WEJ Shoes order.",
};

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}
