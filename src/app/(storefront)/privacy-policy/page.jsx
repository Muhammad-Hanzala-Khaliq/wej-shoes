import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | WEJ Shoes",
  description:
    "How WEJ Shoes collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="heading-lg mb-8">Privacy Policy</h1>

      <p className="text-gray-500 text-sm mb-8">Last updated: June 2025</p>

      <div className="space-y-8">
        <section>
          <h2 className="heading-md mb-3">Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed">
            When you place an order or create an account on WEJ Shoes, we
            collect personal information necessary to process your purchase and
            provide our services. This includes your full name, email address,
            phone number, shipping address, and order history. We also collect
            standard web analytics data such as browser type, device
            information, and pages visited to improve your shopping experience.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed">
            We use the information we collect to process and fulfill your orders,
            coordinate delivery through our courier partners, and provide
            customer support when you reach out to us. Your data also helps us
            improve our website, product offerings, and overall service quality.
            We do not use your personal information for automated decision-making
            or profiling.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Data Sharing</h2>
          <p className="text-gray-700 leading-relaxed">
            We share your information only with trusted courier partners for the
            sole purpose of delivering your orders. Your name, phone number, and
            shipping address are shared with the delivery company so they can
            reach you. We never sell, rent, or trade your personal data to third
            parties for marketing or any other purpose.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Cookies</h2>
          <p className="text-gray-700 leading-relaxed">
            Our website uses minimal session cookies to keep your shopping cart
            functional and to maintain your login session. These cookies are
            essential for the site to work properly and do not track your
            activity across other websites. We do not use any third-party
            tracking cookies or advertising pixels at this time.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            Your account information is retained as long as your account remains
            active. If you delete your account, we remove your personal data
            within a reasonable period. Order records are kept for a longer period
            to comply with legal, tax, and accounting requirements under Pakistani
            law.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Your Rights</h2>
          <p className="text-gray-700 leading-relaxed">
            You have the right to request access to the personal data we hold
            about you, ask for corrections to any inaccurate information, and
            request deletion of your data where legally permissible. To exercise
            any of these rights, please email us at{" "}
            <span className="font-medium">support@wejshoes.com</span> and we
            will respond within a reasonable timeframe.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We take the security of your data seriously. All data transmitted
            between your browser and our servers is protected using SSL/TLS
            encryption. User passwords are stored as secure hashes and are never
            visible to our staff. Our payment process follows secure handling
            standards appropriate for cash-on-delivery operations.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or legal requirements. Any updates will be
            posted on this page with a revised date. We encourage you to review
            this page periodically.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions or concerns about this Privacy Policy,
            please contact us at{" "}
            <span className="font-medium">support@wejshoes.com</span>. You can
            also reach us through the contact information provided on our Contact
            page.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
        <Link
          href="/"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--text-primary)" }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
