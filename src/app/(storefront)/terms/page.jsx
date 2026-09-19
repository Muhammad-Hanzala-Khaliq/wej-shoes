import Link from "next/link";

export const metadata = {
  title: "Terms of Service | WEJ Shoes",
  description: "Terms and conditions for using WEJ Shoes online store.",
};

export default function TermsPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="heading-lg mb-8">Terms of Service</h1>

      <p className="text-gray-500 text-sm mb-8">Last updated: June 2025</p>

      <div className="space-y-8">
        <section>
          <h2 className="heading-md mb-3">Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using the WEJ Shoes website and placing an order,
            you agree to be bound by these Terms of Service. If you do not agree
            with any part of these terms, please do not use our website.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Products & Pricing</h2>
          <p className="text-gray-700 leading-relaxed">
            All prices displayed on this website are in Pakistani Rupees (PKR).
            We reserve the right to update product prices at any time without
            prior notice. Product images are representative and actual colors or
            details may vary slightly due to screen differences. We make every
            effort to display product information accurately, but we do not
            warrant that descriptions, pricing, or other content is error-free.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Orders & Payment</h2>
          <p className="text-gray-700 leading-relaxed">
            We operate on a Cash on Delivery (COD) basis only. Payment is
            collected at the time of delivery. After placing an order, you will
            receive an order number for tracking purposes. We reserve the right
            to cancel or refuse any order if the product is out of stock, if
            there is a pricing error, or if we suspect fraudulent activity. In
            such cases, you will be notified and any applicable refunds will be
            processed.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Shipping & Delivery</h2>
          <p className="text-gray-700 leading-relaxed">
            We deliver across Pakistan through our trusted courier partners.
            Standard delivery typically takes 3 to 5 business days depending on
            your location. Shipping charges are calculated and displayed at
            checkout before you confirm your order. Delivery times are estimates
            and may vary due to factors beyond our control, such as weather
            conditions or courier delays.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Returns & Exchange</h2>
          <p className="text-gray-700 leading-relaxed">
            We offer a 7-day exchange policy from the date of delivery. Items
            must be unused, in their original packaging, and with all tags
            intact. For full details on eligibility, process, and exceptions,
            please refer to our{" "}
            <Link href="/returns" className="underline font-medium">
              Returns & Exchange Policy
            </Link>{" "}
            page.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Account Responsibility</h2>
          <p className="text-gray-700 leading-relaxed">
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. If you suspect any unauthorized access to your account,
            please notify us immediately so we can take appropriate action.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed">
            All content on this website, including but not limited to logos,
            images, text, graphics, and design elements, is the property of WEJ
            Shoes and is protected by applicable intellectual property laws. You
            may not reproduce, distribute, or create derivative works from any
            content without our express written permission.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            WEJ Shoes shall not be held liable for any indirect, incidental, or
            consequential damages arising from the use of our website or
            products. We are not responsible for delivery delays caused by
            third-party courier services or circumstances beyond our reasonable
            control. Our total liability for any claim shall not exceed the
            amount paid for the product in question.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms of Service are governed by the laws of Pakistan. Any
            disputes arising from or related to these terms or your use of our
            website shall be subject to the exclusive jurisdiction of the courts
            in Faisalabad, Pakistan.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about these Terms of Service, please
            contact us at{" "}
            <span className="font-medium">support@wejshoes.com</span> or visit
            our Contact page for additional contact information.
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
