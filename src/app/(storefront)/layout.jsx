import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import CookieBanner from "@/components/storefront/CookieBanner";

export default function StorefrontLayout({ children }) {
  return (
    <div className="flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 min-h-screen">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
