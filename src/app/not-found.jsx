import Link from "next/link";

export const metadata = {
  title: "Page Not Found | WEJ Shoes",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold mb-4" style={{ color: "var(--text-muted)" }}>404</p>
        <h1 className="heading-lg mb-4">Page Not Found</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary">Home</Link>
          <Link href="/collections/men" className="btn btn-outline">Men</Link>
          <Link href="/collections/women" className="btn btn-outline">Women</Link>
          <Link href="/collections/kids" className="btn btn-outline">Kids</Link>
          <Link href="/track-order" className="btn btn-outline">Track Order</Link>
        </div>
      </div>
    </div>
  );
}
