import Link from "next/link";
import PageHero from "@/components/storefront/PageHero";

export const metadata = {
  title: "Return & Exchange Policy | HADAIRE FOOTWEAR",
  description:
    "Learn about our return and exchange policy for orders placed at HADAIRE FOOTWEAR.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/policies/returns`,
  },
};

export default function ReturnPolicyPage() {
  return (
    <div>
      <PageHero
        eyebrow="Our Policies"
        title="Return & Exchange Policy"
        subtitle="We want you to be completely satisfied with your purchase. Here's how returns and exchanges work."
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-6">
        {/* Return Window */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Return Window</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            You have <strong>7 days from the date of delivery</strong> to initiate
            a return. After this period, returns will not be accepted. We
            recommend inspecting your order upon delivery.
          </p>
        </div>

        {/* Eligibility */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Eligibility Criteria
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            To be eligible for a return, the following conditions must be met:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1">
            <li>Item is unused and in its original condition</li>
            <li>Original packaging is intact</li>
            <li>All tags and labels are attached</li>
            <li>No signs of wear, damage, or alteration</li>
            <li>Item is in the same condition as received</li>
          </ul>
        </div>

        {/* How to Initiate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              How to Initiate a Return
            </h2>
          </div>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>
              <strong>Contact us</strong> via our{" "}
              <Link
                href="/contact"
                className="text-amber-600 hover:underline font-medium"
              >
                Contact Page
              </Link>{" "}
              or WhatsApp
            </li>
            <li>
              Provide your <strong>order number</strong> and reason for return
            </li>
            <li>
              Our team will review your request and provide return instructions
            </li>
            <li>Pack the item securely in its original packaging</li>
            <li>
              Ship the item back using the provided return label or arrange
              pickup
            </li>
          </ol>
        </div>

        {/* Exchange Policy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Exchange Policy</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            We offer exchanges for different sizes or colors, subject to
            availability. To request an exchange:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1">
            <li>Contact us within 7 days of delivery</li>
            <li>
              Specify the item and the size/color you&apos;d like instead
            </li>
            <li>We&apos;ll check availability and arrange the exchange</li>
            <li>
              If the new item costs more, you&apos;ll pay the difference via COD
            </li>
            <li>If it costs less, the difference will be refunded</li>
          </ul>
        </div>

        {/* Refund Process */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Refund Process</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Since we operate on Cash on Delivery, refunds are processed as
            follows:
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mt-3 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Bank Transfer</p>
                <p className="text-sm text-gray-600">
                  Refund will be transferred to your bank account within 5-7
                  business days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Non-Returnable Items
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            The following items are not eligible for return:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1">
            <li>Items that have been used or worn</li>
            <li>Items without original tags or packaging</li>
            <li>Items returned after the 7-day window</li>
            <li>Items that have been altered or damaged by the customer</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Need Help with a Return?
          </h2>
          <p className="text-gray-600 mb-4">
            Our support team is ready to assist you with any return or exchange
            requests.
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
