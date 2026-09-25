import Link from "next/link";
import PageHero from "@/components/storefront/PageHero";

export const metadata = {
  title: "Terms of Service | HADAIRE FOOTWEAR",
  description: "Terms and conditions for using HADAIRE FOOTWEAR online store.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/terms`,
  },
};

const SECTIONS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Acceptance of Terms",
    content:
      "By accessing or using the HADAIRE FOOTWEAR website and placing an order, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    title: "Products & Pricing",
    content:
      "All prices displayed on this website are in Pakistani Rupees (PKR). We reserve the right to update product prices at any time without prior notice. Product images are representative and actual colors or details may vary slightly due to screen differences. We make every effort to display product information accurately, but we do not warrant that descriptions, pricing, or other content is error-free.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "Orders & Payment",
    content:
      "We operate on a Cash on Delivery (COD) basis only. Payment is collected at the time of delivery. After placing an order, you will receive an order number for tracking purposes. We reserve the right to cancel or refuse any order if the product is out of stock, if there is a pricing error, or if we suspect fraudulent activity. In such cases, you will be notified and any applicable refunds will be processed.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    title: "Shipping & Delivery",
    content:
      "We deliver across Pakistan through our trusted courier partners. Standard delivery typically takes 3 to 5 business days depending on your location. Shipping charges are calculated and displayed at checkout before you confirm your order. Delivery times are estimates and may vary due to factors beyond our control, such as weather conditions or courier delays.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Returns & Exchange",
    content:
      "We offer a 7-day exchange policy from the date of delivery. Items must be unused, in their original packaging, and with all tags intact. For full details on eligibility, process, and exceptions, please refer to our Returns & Exchange Policy page.",
    link: { href: "/policies/returns", label: "Returns & Exchange Policy" },
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Account Responsibility",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. If you suspect any unauthorized access to your account, please notify us immediately so we can take appropriate action.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: "Intellectual Property",
    content:
      "All content on this website, including but not limited to logos, images, text, graphics, and design elements, is the property of HADAIRE FOOTWEAR and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our express written permission.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    title: "Limitation of Liability",
    content:
      "HADAIRE FOOTWEAR shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our website or products. We are not responsible for delivery delays caused by third-party courier services or circumstances beyond our reasonable control. Our total liability for any claim shall not exceed the amount paid for the product in question.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    title: "Governing Law",
    content:
      "These Terms of Service are governed by the laws of Pakistan. Any disputes arising from or related to these terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in Faisalabad, Pakistan.",
  },
];

export default function TermsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The rules and guidelines for using our website and services."
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <p className="text-gray-500 text-sm mb-8">Last updated: June 2025</p>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {section.title}
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {section.content.split(section.link?.label || "___").map((part, i, arr) => {
                  if (!section.link || i === arr.length - 1) return part;
                  return (
                    <span key={i}>
                      {part}
                      <Link
                        href={section.link.href}
                        className="text-amber-600 hover:underline font-medium"
                      >
                        {section.link.label}
                      </Link>
                    </span>
                  );
                })}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
