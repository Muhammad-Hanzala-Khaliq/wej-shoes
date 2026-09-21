/**
 * Shared hero banner for static pages.
 * Warm ivory background with amber accent eyebrow + underline bar.
 */
export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <section className="bg-[#f7f3ec] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        {eyebrow && (
          <p className="text-amber-600 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{title}</h1>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-amber-500" />
        {subtitle && (
          <p className="text-gray-600 mt-5 max-w-xl mx-auto text-base md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
