import TrackOrderClient from "@/components/storefront/TrackOrderClient";

export const metadata = {
  title: "Track Order | WEJ Shoes",
  description: "Track your WEJ Shoes order status using your order number and phone number.",
};

export default function TrackOrderPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>
      <TrackOrderClient />
    </div>
  );
}
