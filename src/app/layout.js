import "./globals.css";
import { Archivo, Roboto } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
import CartProvider from "@/features/cart/CartProvider";
import CartToast from "@/components/storefront/CartToast";
import { SettingsProvider } from "@/features/cms/settings-context";
import ScrollToTop from "@/components/ScrollToTop";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata = {
  title: "HADAIRE FOOTWEAR | Premium Luxury Shoes",
  description:
    "HADAIRE FOOTWEAR - premium luxury footwear for men, women, and kids in Pakistan. Elegant craftsmanship, Cash on Delivery available.",
  openGraph: {
    title: "HADAIRE FOOTWEAR | Premium Luxury Shoes",
    siteName: "HADAIRE FOOTWEAR",
    description:
      "HADAIRE FOOTWEAR - premium luxury footwear for men, women, and kids in Pakistan. Elegant craftsmanship, Cash on Delivery available.",
    type: "website",
  },
  twitter: {
    title: "HADAIRE FOOTWEAR | Premium Luxury Shoes",
    description:
      "HADAIRE FOOTWEAR - premium luxury footwear for men, women, and kids in Pakistan. Elegant craftsmanship, Cash on Delivery available.",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HADAIRE FOOTWEAR",
  url: siteUrl,
  logo: `${siteUrl}/logo-light.png`,
  description: "Premium luxury footwear for men and women",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+92-305-2082552",
    contactType: "customer service",
    email: "info@hadairefootwear.com",
    availableLanguage: ["English", "Urdu"],
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "PK",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${roboto.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <CartProvider>
            <CartToast />
            <ScrollToTop />
            <SettingsProvider>
              <main id="main-content" className="flex-1 min-h-screen">{children}</main>
            </SettingsProvider>
          </CartProvider>
        </SessionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </body>
    </html>
  );
}
