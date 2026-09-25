import Link from "next/link";
import PageHero from "@/components/storefront/PageHero";

export const metadata = {
  title: "Shipping Policy | HADAIRE FOOTWEAR",
  description:
    "Learn about our shipping policy, delivery times, and cash on delivery options.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/policies/shipping`,
  },
};

export default function ShippingPolicyPage() {
  return (
    <div>
      <PageHero
        eyebrow="Our Policies"
        title="Shipping Policy"
        subtitle="Everything you need to know about how we deliver your orders across Pakistan."
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-6">
        {/* Delivery Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delivery Time</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            We aim to deliver your order within <strong>3-5 business days</strong>{" "}
            from the date of order confirmation. Delivery times may vary slightly
            for remote areas or during peak seasons (e.g., Eid, sales events).
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1">
            <li>Major cities (Karachi, Lahore, Islamabad): 2-4 business days</li>
            <li>Other cities: 3-5 business days</li>
            <li>Remote areas: 5-7 business days</li>
          </ul>
        </div>

        {/* Shipping Charges */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Shipping Charges</h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-right px-4 py-3 font-semibold">Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="px-4 py-3 text-gray-700">Standard Shipping</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">PKR 200</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Free Shipping (orders over PKR 5,000)</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">Free</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
            <strong>Note:</strong> Shipping charges are flat PKR 200 per order.
            Orders above PKR 5,000 qualify for free shipping. The shipping fee
            will be displayed at checkout before you place your order.
          </div>
        </div>

        {/* Delivery Areas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delivery Areas</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            We deliver to all major cities and towns across Pakistan, including
            but not limited to:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {[
              "Karachi",
              "Lahore",
              "Islamabad",
              "Rawalpindi",
              "Faisalabad",
              "Peshawar",
              "Quetta",
              "Multan",
              "Sialkot",
              "Gujranwala",
              "Hyderabad",
              "Abbottabad",
            ].map((city) => (
              <div
                key={city}
                className="bg-gray-50 rounded px-3 py-2 text-sm text-gray-700"
              >
                {city}
              </div>
            ))}
          </div>
          <p className="text-gray-600 mt-3">
            If your area is not listed above, please contact us before placing
            your order to confirm delivery availability.
          </p>
        </div>

        {/* Order Tracking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Once your order is confirmed, you can track its status using our
            online tracking system:
          </p>
          <ol className="list-decimal list-inside text-gray-600 mt-3 space-y-1">
            <li>
              Go to the{" "}
              <Link href="/track-order" className="text-amber-600 hover:underline font-medium">
                Track Order
              </Link>{" "}
              page
            </li>
            <li>Enter your order number (e.g., ORD-00001)</li>
            <li>Enter the phone number used during checkout</li>
            <li>View your order status in real-time</li>
          </ol>
        </div>

        {/* Cash on Delivery */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cash on Delivery</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            We offer <strong>Cash on Delivery (COD)</strong> as our primary
            payment method. This means:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1">
            <li>No advance payment required</li>
            <li>Pay the full amount when you receive your order</li>
            <li>Please keep the exact amount ready for a smooth transaction</li>
            <li>Our delivery agent will collect the payment at your doorstep</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Shipping Issues?
          </h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about shipping or face issues with your
            delivery, please don&apos;t hesitate to contact us.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
