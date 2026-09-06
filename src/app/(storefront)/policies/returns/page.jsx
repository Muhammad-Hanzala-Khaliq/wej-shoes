import Link from "next/link";

export const metadata = {
  title: "Return & Exchange Policy | WEJ Shoes",
  description: "Learn about our return and exchange policy for orders placed at WEJ Shoes.",
};

export default function ReturnPolicyPage() {
  return (
    <div>
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h1 className="text-4xl font-bold text-center">Return & Exchange Policy</h1>
          <p className="text-gray-300 text-center mt-4 max-w-xl mx-auto">
            We want you to be completely satisfied with your purchase. Here&apos;s how
            returns and exchanges work.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="prose prose-gray max-w-none space-y-10">
          {/* Return Window */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Return Window</h2>
            <p className="text-gray-600 leading-relaxed">
              You have <strong>7 days from the date of delivery</strong> to initiate a
              return. After this period, returns will not be accepted. We recommend
              inspecting your order upon delivery.
            </p>
          </div>

          {/* Eligibility */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Eligibility Criteria</h2>
            <p className="text-gray-600 leading-relaxed">
              To be eligible for a return, the following conditions must be met:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Item is unused and in its original condition</li>
              <li>Original packaging is intact</li>
              <li>All tags and labels are attached</li>
              <li>No signs of wear, damage, or alteration</li>
              <li>Item is in the same condition as received</li>
            </ul>
          </div>

          {/* How to Initiate */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              How to Initiate a Return
            </h2>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>
                <strong>Contact us</strong> via our{" "}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact Page
                </Link>{" "}
                or WhatsApp
              </li>
              <li>
                Provide your <strong>order number</strong> and reason for return
              </li>
              <li>Our team will review your request and provide return instructions</li>
              <li>Pack the item securely in its original packaging</li>
              <li>
                Ship the item back using the provided return label or arrange pickup
              </li>
            </ol>
          </div>

          {/* Exchange Policy */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Exchange Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We offer exchanges for different sizes or colors, subject to availability.
              To request an exchange:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Contact us within 7 days of delivery</li>
              <li>Specify the item and the size/color you&apos;d like instead</li>
              <li>We&apos;ll check availability and arrange the exchange</li>
              <li>If the new item costs more, you&apos;ll pay the difference via COD</li>
              <li>If it costs less, the difference will be refunded</li>
            </ul>
          </div>

          {/* Refund Process */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Refund Process</h2>
            <p className="text-gray-600 leading-relaxed">
              Since we operate on Cash on Delivery, refunds are processed as follows:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 not-prose mt-3 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-sm text-gray-600">
                    Refund will be transferred to your bank account within 5-7 business days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Store Credit</p>
                  <p className="text-sm text-gray-600">
                    Option to receive store credit for your next purchase (instant)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Non-returnable */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Non-Returnable Items</h2>
            <p className="text-gray-600 leading-relaxed">
              The following items are not eligible for return:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Items that have been used or worn</li>
              <li>Items without original tags or packaging</li>
              <li>Items returned after the 7-day window</li>
              <li>Items that have been altered or damaged by the customer</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-lg p-6 not-prose">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Need Help with a Return?
            </h2>
            <p className="text-gray-600 mb-4">
              Our support team is ready to assist you with any return or exchange requests.
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
