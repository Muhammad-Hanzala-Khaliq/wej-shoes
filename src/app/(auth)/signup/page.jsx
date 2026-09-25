import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign Up | HADAIRE FOOTWEAR",
  description: "Create your HADAIRE FOOTWEAR account to track orders and enjoy a personalized shopping experience.",
};

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return <SignupForm />;
}
