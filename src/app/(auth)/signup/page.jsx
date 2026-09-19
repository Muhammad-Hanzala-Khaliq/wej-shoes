import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign Up | WEJ Shoes",
  description: "Create your WEJ Shoes account to track orders and enjoy a personalized shopping experience.",
};

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return <SignupForm />;
}
