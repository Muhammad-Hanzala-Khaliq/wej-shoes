import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  const { session, error } = await getAdminSession();

  if (error === null && session) {
    redirect("/admin/dashboard");
  }

  if (error === "forbidden") {
    redirect("/");
  }

  return <AdminLoginForm />;
}
