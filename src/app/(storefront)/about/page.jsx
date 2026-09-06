import Link from "next/link";

export const metadata = {
  title: "About Us | WEJ Shoes",
  description:
    "Learn about WEJ Shoes - Premium footwear brand in Pakistan offering quality craftsmanship and modern designs.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              WEJ Shoes was born from a simple belief: everyone deserves access to premium
              footwear without compromising on quality or breaking the bank. What started as
              a small idea has grown into a trusted brand serving customers across Pakistan.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            To craft premium footwear that combines comfort, style, and durability — making
            quality accessible to every Pakistani. We believe that great shoes empower you
            to walk with confidence, whether at work, at home, or out with friends.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose WEJ Shoes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Craftsmanship</h3>
              <p className="text-gray-600 text-sm">
                Every pair is meticulously crafted with attention to detail, ensuring
                superior comfort and lasting durability.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Materials</h3>
              <p className="text-gray-600 text-sm">
                We source only the finest materials — genuine leather, high-grade
                synthetics, and cushioned insoles for all-day comfort.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer First</h3>
              <p className="text-gray-600 text-sm">
                Your satisfaction is our priority. From easy ordering to hassle-free
                returns, we put you first at every step.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash on Delivery</h3>
              <p className="text-gray-600 text-sm">
                Shop with confidence — pay only when your order arrives at your doorstep.
                No advance payment, no risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shrink-0 mt-1">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Authenticity</h3>
                <p className="text-gray-600">
                  We are committed to delivering genuine, high-quality products. Every pair
                  of shoes you receive from WEJ Shoes is 100% authentic.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shrink-0 mt-1">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Accessibility</h3>
                <p className="text-gray-600">
                  Premium footwear should not be a luxury. We offer competitive prices and
                  Cash on Delivery across Pakistan to make shopping easy for everyone.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shrink-0 mt-1">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Sustainability</h3>
                <p className="text-gray-600">
                  We are mindful of our environmental impact and strive to use sustainable
                  materials and practices wherever possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Step Into Style?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Explore our collections and find the perfect pair for every occasion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/collections/men"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Shop Men
            </Link>
            <Link
              href="/collections/women"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              Shop Women
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
