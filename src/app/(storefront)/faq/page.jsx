import Link from "next/link";
import FaqAccordion from "@/components/storefront/FaqAccordion";
import PageHero from "@/components/storefront/PageHero";

export const metadata = {
  title: "FAQ | HADAIRE FOOTWEAR",
  description:
    "Frequently asked questions about orders, payment, returns, and products at HADAIRE FOOTWEAR.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/faq`,
  },
};

const FAQ_DATA = [
  {
    category: "Orders & Delivery",
    items: [
      {
        question: "How long does delivery take?",
        answer:
          "We deliver within 3-5 business days across Pakistan. Delivery times may vary slightly for remote areas.",
      },
      {
        question: "Do you deliver all over Pakistan?",
        answer:
          "Yes, we deliver to all major cities and towns across Pakistan, including Karachi, Lahore, Islamabad, Peshawar, Quetta, and more.",
      },
      {
        question: "How can I track my order?",
        answer:
          "You can track your order by visiting our Track Order page. Simply enter your order number and phone number to see the current status of your order.",
      },
      {
        question: "Can I cancel my order?",
        answer:
          "Yes, you can cancel your order before it has been shipped. Once the order is shipped, cancellation is no longer possible. Contact us immediately if you wish to cancel.",
      },
    ],
  },
  {
    category: "Payment",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We currently accept Cash on Delivery (COD) only. You pay when your order arrives at your doorstep.",
      },
      {
        question: "Is there any advance payment required?",
        answer:
          "No advance payment is required. With Cash on Delivery, you pay the full amount when you receive your order.",
      },
    ],
  },
  {
    category: "Returns & Exchange",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 7-day return policy from the date of delivery. Items must be unused, in original packaging, with all tags intact.",
      },
      {
        question: "How do I return a product?",
        answer:
          "To initiate a return, contact us with your order number and reason for return. Our team will guide you through the process.",
      },
      {
        question: "Can I exchange for a different size?",
        answer:
          "Yes, size exchange is possible subject to availability. Contact us within 7 days of delivery with your order number.",
      },
    ],
  },
  {
    category: "Products",
    items: [
      {
        question: "Are your products genuine?",
        answer:
          "Yes, all our products are 100% authentic. We stand behind the quality and authenticity of every pair of shoes we sell.",
      },
      {
        question: "How do I find my size?",
        answer:
          "Check the size guide available on each product page. If you're between sizes, we recommend ordering the larger size for a comfortable fit.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div>
      <PageHero
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about orders, payment, returns, and more."
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <FaqAccordion faqData={FAQ_DATA} />
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? We&apos;re here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
