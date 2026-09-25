import AccountClient from "@/components/storefront/AccountClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | HADAIRE FOOTWEAR",
  description: "Manage your HADAIRE FOOTWEAR account, view orders, and update your profile.",
};

export default function AccountPage() {
  return <AccountClient />;
}
