import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login | HADAIRE FOOTWEAR",
  description: "Login to your HADAIRE FOOTWEAR account to track orders and manage your profile.",
};

function LoginFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--surface-soft)" }}
    >
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
