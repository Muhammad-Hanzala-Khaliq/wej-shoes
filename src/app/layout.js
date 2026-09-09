import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import CartProvider from "@/features/cart/CartProvider";
import CartToast from "@/components/storefront/CartToast";
import { SettingsProvider } from "@/features/cms/settings-context";
import { auth } from "@/auth";

export const metadata = {
  title: "WEJ Shoes - Premium Footwear",
  description: "Quality footwear for men and women",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <CartProvider>
            <CartToast />
            <SettingsProvider>{children}</SettingsProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
