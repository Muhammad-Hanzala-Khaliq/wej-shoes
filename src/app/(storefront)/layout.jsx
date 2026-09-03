import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function StorefrontLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
