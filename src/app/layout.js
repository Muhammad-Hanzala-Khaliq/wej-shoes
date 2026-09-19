import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import CartProvider from "@/features/cart/CartProvider";
import CartToast from "@/components/storefront/CartToast";
import { SettingsProvider } from "@/features/cms/settings-context";

export const metadata = {
  title: "WEJ Shoes - Premium Footwear",
  description: "Quality footwear for men and women",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <CartProvider>
            <CartToast />
            <SettingsProvider>
              <main id="main-content">{children}</main>
            </SettingsProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
