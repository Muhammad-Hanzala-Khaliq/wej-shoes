import OrderHistoryClient from "@/components/storefront/OrderHistoryClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Orders | WEJ Shoes",
  description: "View your order history and track past purchases.",
};

export default function OrderHistoryPage() {
  return <OrderHistoryClient />;
}
