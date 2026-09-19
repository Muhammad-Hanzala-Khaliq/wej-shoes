import { redirect } from "next/navigation";
import { ToastProvider } from "@/components/admin/ToastProvider";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: {
    template: "%s | WEJ Admin",
    default: "Admin Dashboard | WEJ Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }) {
  const { session, error } = await getAdminSession();

  if (error === "unauthenticated") {
    redirect("/admin-login");
  }

  if (error === "forbidden") {
    redirect("/");
  }

  return (
    <ToastProvider>
      <AdminShell userName={session.user.name}>{children}</AdminShell>
    </ToastProvider>
  );
}
