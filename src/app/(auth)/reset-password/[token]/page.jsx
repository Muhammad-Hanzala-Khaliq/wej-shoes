import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | HADAIRE FOOTWEAR",
  description: "Set a new password for your HADAIRE FOOTWEAR account.",
};

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}
