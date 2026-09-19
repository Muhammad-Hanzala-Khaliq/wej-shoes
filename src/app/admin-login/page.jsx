import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Admin Login | WEJ Admin",
  robots: {
    index: false,
    follow: false,
  },
};

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
