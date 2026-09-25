import Image from "next/image";
import Link from "next/link";

export default function SplitFeatureSection({
  image,
  imageAlt,
  heading,
  subtitle,
  description,
  buttonText,
  buttonLink,
}) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-10 md:gap-16 items-center">
          {/* Image column — portrait 4/5 crop */}
          <Image
            src={image}
            alt={imageAlt}
            width={800}
            height={1000}
            className="aspect-[4/5] w-full h-full object-cover"
          />

          {/* Text column — fully centered */}
          <div className="text-center">
            <h2 className="text-4xl md:text-4xl font-semibold tracking-wide text-gray-800">
              {heading}
            </h2>
            <p className="mt-4 text-base md:text-md uppercase tracking-[0.15em] text-gray-500">
              {subtitle}
            </p>
            <p className="mt-4 text-gray-600 max-w-xl mx-auto">
              {description}
            </p>
            <Link
              href={buttonLink}
              className="mt-8 inline-block bg-black text-white px-10 py-4 text-sm font-semibold tracking-wider hover:bg-gray-800 transition-colors"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
