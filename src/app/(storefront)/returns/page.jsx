import Link from "next/link";

export const metadata = {
  title: "Returns & Exchange Policy | WEJ Shoes",
  description: "7-day exchange policy details for WEJ Shoes orders.",
};

export default function ReturnsPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="heading-lg mb-8">Returns & Exchange Policy</h1>

      <div className="space-y-8">
        <section>
          <h2 className="heading-md mb-3">Our Promise</h2>
          <p className="text-gray-700 leading-relaxed">
            At WEJ Shoes, your satisfaction matters to us. We offer a 7-day
            exchange policy on all orders so you can shop with confidence. If
            you are not completely satisfied with your purchase, we will work
            with you to find a suitable replacement.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Eligibility</h2>
          <p className="text-gray-700 leading-relaxed">
            To be eligible for an exchange, your request must be made within 7
            days of receiving your delivery. The item must be unworn and unused,
            with all original packaging and tags still intact. You will need to
            provide your receipt or order number as proof of purchase.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">How to Request an Exchange</h2>
          <p className="text-gray-700 leading-relaxed">
            To initiate an exchange, contact us via email at{" "}
            <span className="font-medium">support@wejshoes.com</span> or call
            our customer support line. Include your order number and briefly
            describe the issue with the item. Our team will review your request
            and provide you with detailed exchange instructions.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Exchange Process</h2>
          <p className="text-gray-700 leading-relaxed">
            Once your exchange request is approved, you will need to ship the
            item back to us at the address provided. After we receive and inspect
            the returned item, we will dispatch the replacement to you. Please
            note that the customer is responsible for return shipping costs
            unless the item was delivered defective or incorrect.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Refunds</h2>
          <p className="text-gray-700 leading-relaxed">
            We operate on an exchange-only basis and do not offer cash refunds.
            If the item you requested as a replacement is out of stock, we will
            issue store credit for the full value of your original purchase,
            which you can use on any future order.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Non-Exchangeable Items</h2>
          <p className="text-gray-700 leading-relaxed">
            The following items are not eligible for exchange: items that have
            been worn or damaged by the customer, items returned without their
            original packaging or tags, and sale or clearance items that were
            marked as final sale at the time of purchase.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Defective Products</h2>
          <p className="text-gray-700 leading-relaxed">
            If you receive a defective product, please contact us within 48
            hours of delivery with photos showing the defect. We will arrange
            a replacement and cover the return shipping costs for items confirmed
            to be defective upon inspection.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Timeline</h2>
          <p className="text-gray-700 leading-relaxed">
            All exchanges are processed within 5 to 7 business days after we
            receive the returned item. You will receive a confirmation once your
            replacement has been dispatched.
          </p>
        </section>

        <section>
          <h2 className="heading-md mb-3">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            For any questions about our Returns & Exchange Policy, reach out to
            us at{" "}
            <span className="font-medium">support@wejshoes.com</span> or call
            our customer support line. We are here to help.
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
