"use client";

import { useState } from "react";

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
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (category, index) => {
    const key = `${category}-${index}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h1 className="text-4xl font-bold text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-300 text-center mt-4 max-w-xl mx-auto">
            Find answers to common questions about orders, payment, returns, and more.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="space-y-10">
          {FAQ_DATA.map((category) => (
            <div key={category.category}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {category.category}
              </h2>
              <div className="space-y-2">
                {category.items.map((item, index) => {
                  const isOpen = openItems[`${category.category}-${index}`];
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(category.category, index)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">
                          {item.question}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-gray-600 border-t border-gray-100">
                          <p className="pt-3">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? We&apos;re here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
