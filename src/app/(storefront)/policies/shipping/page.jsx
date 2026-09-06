import Link from "next/link";

export const metadata = {
  title: "Shipping Policy | WEJ Shoes",
  description: "Learn about our shipping policy, delivery times, and cash on delivery options.",
};

export default function ShippingPolicyPage() {
  return (
    <div>
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h1 className="text-4xl font-bold text-center">Shipping Policy</h1>
          <p className="text-gray-300 text-center mt-4 max-w-xl mx-auto">
            Everything you need to know about how we deliver your orders across Pakistan.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="prose prose-gray max-w-none space-y-10">
          {/* Delivery Time */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Delivery Time</h2>
            <p className="text-gray-600 leading-relaxed">
              We aim to deliver your order within <strong>3-5 business days</strong> from
              the date of order confirmation. Delivery times may vary slightly for remote
              areas or during peak seasons (e.g., Eid, sales events).
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Major cities (Karachi, Lahore, Islamabad): 2-4 business days</li>
              <li>Other cities: 3-5 business days</li>
              <li>Remote areas: 5-7 business days</li>
            </ul>
          </div>

          {/* Shipping Charges */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Shipping Charges</h2>
            <div className="bg-gray-50 rounded-lg p-6 not-prose">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Standard Shipping</span>
                  <span className="font-semibold text-gray-900">PKR 200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Free Shipping on orders over</span>
                  <span className="font-semibold text-green-600">PKR 5,000</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mt-3">
              Shipping charges are flat PKR 200 per order. Orders above PKR 5,000 qualify
              for free shipping. The shipping fee will be displayed at checkout before you
              place your order.
            </p>
          </div>

          {/* Delivery Areas */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Delivery Areas</h2>
            <p className="text-gray-600 leading-relaxed">
              We deliver to all major cities and towns across Pakistan, including but not
              limited to:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 not-prose">
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
                <div key={city} className="bg-gray-50 rounded px-3 py-2 text-sm text-gray-700">
                  {city}
                </div>
              ))}
            </div>
            <p className="text-gray-600 mt-3">
              If your area is not listed above, please contact us before placing your order
              to confirm delivery availability.
            </p>
          </div>

          {/* Order Tracking */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              Once your order is confirmed, you can track its status using our online
              tracking system:
            </p>
            <ol className="list-decimal list-inside text-gray-600 mt-2 space-y-1">
              <li>Go to the <Link href="/track-order" className="text-blue-600 hover:underline">Track Order</Link> page</li>
              <li>Enter your order number (e.g., WEJ-00001)</li>
              <li>Enter the phone number used during checkout</li>
              <li>View your order status in real-time</li>
            </ol>
          </div>

          {/* Cash on Delivery */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Cash on Delivery</h2>
            <p className="text-gray-600 leading-relaxed">
              We offer <strong>Cash on Delivery (COD)</strong> as our primary payment method.
              This means:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>No advance payment required</li>
              <li>Pay the full amount when you receive your order</li>
              <li>Please keep the exact amount ready for a smooth transaction</li>
              <li>Our delivery agent will collect the payment at your doorstep</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-lg p-6 not-prose">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Shipping Issues?
            </h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about shipping or face issues with your delivery,
              please don&apos;t hesitate to contact us.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
