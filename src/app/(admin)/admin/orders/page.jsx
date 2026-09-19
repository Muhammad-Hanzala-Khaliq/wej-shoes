import { listAdminOrders } from "@/features/orders/order.service";
import OrdersClient from "./OrdersClient";

export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || undefined;
  const search = params.search || undefined;

  const result = await listAdminOrders({ page, limit: 20, status, search });

  const orders = JSON.parse(JSON.stringify(result.orders));

  return (
    <OrdersClient
      initialOrders={orders}
      initialPagination={result.pagination}
    />
  );
}
