import { getDashboardStats } from "@/features/admin/dashboard.service";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const serialized = JSON.parse(JSON.stringify(stats));

  return <DashboardClient stats={serialized} />;
}
