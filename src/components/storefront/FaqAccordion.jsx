"use client";

import { useState } from "react";

export default function FaqAccordion({ faqData }) {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (category, index) => {
    const key = `${category}-${index}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-10">
      {faqData.map((category) => (
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
  );
}
