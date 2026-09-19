import { notFound } from "next/navigation";
import { getAdminOrderDetail } from "@/features/orders/order.service";
import OrderDetailClient from "./OrderDetailClient";

export default async function AdminOrderDetailPage({ params }) {
  const { orderId } = await params;

  let order;
  try {
    order = await getAdminOrderDetail(orderId);
  } catch {
    notFound();
  }

  if (!order) {
    notFound();
  }

  const serialized = JSON.parse(JSON.stringify(order));

  return <OrderDetailClient initialOrder={serialized} />;
}
