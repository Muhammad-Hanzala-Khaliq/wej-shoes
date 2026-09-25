import TrackOrderClient from "@/components/storefront/TrackOrderClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Track Order | HADAIRE FOOTWEAR",
  description: "Track your HADAIRE FOOTWEAR order status using your order number and phone number.",
};

export default function TrackOrderPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>
      <TrackOrderClient />
    </div>
  );
}
