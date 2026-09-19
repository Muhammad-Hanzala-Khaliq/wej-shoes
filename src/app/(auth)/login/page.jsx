import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login | WEJ Shoes",
  description: "Login to your WEJ Shoes account to track orders and manage your profile.",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return <LoginForm />;
}
