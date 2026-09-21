import Link from "next/link";
import PageHero from "@/components/storefront/PageHero";

export const metadata = {
  title: "Privacy Policy | WEJ Shoes",
  description: "How WEJ Shoes collects, uses, and protects your personal data.",
};

const SECTIONS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Information We Collect",
    content:
      "When you place an order or create an account on WEJ Shoes, we collect personal information necessary to process your purchase and provide our services. This includes your full name, email address, phone number, shipping address, and order history. We also collect standard web analytics data such as browser type, device information, and pages visited to improve your shopping experience.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "How We Use Your Information",
    content:
      "We use the information we collect to process and fulfill your orders, coordinate delivery through our courier partners, and provide customer support when you reach out to us. Your data also helps us improve our website, product offerings, and overall service quality. We do not use your personal information for automated decision-making or profiling.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Data Sharing",
    content:
      "We share your information only with trusted courier partners for the sole purpose of delivering your orders. Your name, phone number, and shipping address are shared with the delivery company so they can reach you. We never sell, rent, or trade your personal data to third parties for marketing or any other purpose.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: "Cookies",
    content:
      "Our website uses minimal session cookies to keep your shopping cart functional and to maintain your login session. These cookies are essential for the site to work properly and do not track your activity across other websites. We do not use any third-party tracking cookies or advertising pixels at this time.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Data Retention",
    content:
      "Your account information is retained as long as your account remains active. If you delete your account, we remove your personal data within a reasonable period. Order records are kept for a longer period to comply with legal, tax, and accounting requirements under Pakistani law.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: "Your Rights",
    content:
      "You have the right to request access to the personal data we hold about you, ask for corrections to any inaccurate information, and request deletion of your data where legally permissible. To exercise any of these rights, please email us at support@wejshoes.com and we will respond within a reasonable timeframe.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Security",
    content:
      "We take the security of your data seriously. All data transmitted between your browser and our servers is protected using SSL/TLS encryption. User passwords are stored as secure hashes and are never visible to our staff. Our payment process follows secure handling standards appropriate for cash-on-delivery operations.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Any updates will be posted on this page with a revised date. We encourage you to review this page periodically.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your personal data."
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
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
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
