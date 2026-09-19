import { getShippingRules } from "@/features/cms/cms.service";
import ShippingClient from "./ShippingClient";

export default async function AdminShippingPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const rules = await getShippingRules();
  const items = Array.isArray(rules) ? rules : [];
  const pageSize = 20;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = JSON.parse(
    JSON.stringify(items.slice(start, start + pageSize)),
  );

  return (
    <ShippingClient
      initialRules={pageItems}
      initialTotal={total}
      initialPage={page}
      initialTotalPages={totalPages}
    />
  );
}
