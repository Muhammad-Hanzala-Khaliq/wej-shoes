import Link from "next/link";
import PageHero from "@/components/storefront/PageHero";

export const metadata = {
  title: "About Us | HADAIRE FOOTWEAR",
  description:
    "Learn about HADAIRE FOOTWEAR - Premium footwear brand in Pakistan offering quality craftsmanship and modern designs.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/about`,
  },
};

const VALUES = [
  {
    title: "Quality First",
    description:
      "Every pair of shoes undergoes rigorous quality checks. We use premium materials and modern craftsmanship to ensure durability and comfort.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Affordable Luxury",
    description:
      "Premium doesn't have to mean expensive. We make quality footwear accessible to every Pakistani without compromising on style.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Customer Focus",
    description:
      "From easy ordering to hassle-free returns, we put our customers first. Your satisfaction drives every decision we make.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Fast Delivery",
    description:
      "We deliver across Pakistan within 3-5 business days. Cash on delivery available for a seamless shopping experience.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const MILESTONES = [
  { number: "10K+", label: "Happy Customers" },
  { number: "500+", label: "Products Sold" },
  { number: "50+", label: "Cities Delivered" },
  { number: "4.8", label: "Average Rating" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <PageHero
        eyebrow="Company"
        title="Our Story"
        subtitle="HADAIRE FOOTWEAR was born from a simple belief: everyone deserves access to premium footwear without compromising on quality or breaking the bank."
      />

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            To craft premium footwear that combines comfort, style, and durability
            — making quality accessible to every Pakistani. We believe that great
            shoes empower you to walk with confidence, whether at work, at home,
            or out with friends.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose HADAIRE FOOTWEAR
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Our Journey
          </h2>
          <p className="text-gray-600 leading-relaxed">
            What started as a small online store has grown into a trusted brand
            serving customers across Pakistan. We&apos;ve continuously evolved our
            products and services based on customer feedback and market trends.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {MILESTONES.map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
            >
              <p className="text-3xl font-bold text-amber-600">{item.number}</p>
              <p className="text-sm text-gray-600 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f7f3ec] border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Step Into Style?
          </h2>
          <div className="mx-auto mt-2 mb-6 h-1 w-16 rounded-full bg-amber-500" />
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Explore our collections and find the perfect pair for every
            occasion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/collections/men"
              className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Shop Men
            </Link>
            <Link
              href="/collections/women"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
            >
              Shop Women
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
