import prisma from "@/lib/db";

const BASE_URL = (process.env.NEXTAUTH_URL || process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export default async function sitemap() {
  const now = new Date();

  const staticPages = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/collections/men`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/collections/women`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/collections/kids`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/sale`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/policies/shipping`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/policies/returns`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/track-order`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  let products = [];
  let categories = [];

  try {
    [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE", deletedAt: null },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5000,
      }),
      prisma.category.findMany({
        where: { status: "ACTIVE", deletedAt: null },
        select: { slug: true, gender: true, updatedAt: true },
        take: 200,
      }),
    ]);
  } catch {
    return dedupeUrls(staticPages);
  }

  const productPages = products.map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${BASE_URL}/collections/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return dedupeUrls([...staticPages, ...categoryPages, ...productPages]);
}

/**
 * Dedupe URLs by pathname, keeping the entry with the latest lastModified.
 */
function dedupeUrls(pages) {
  const map = new Map();
  for (const page of pages) {
    const pathname = new URL(page.url).pathname;
    const existing = map.get(pathname);
    if (!existing || new Date(page.lastModified) > new Date(existing.lastModified)) {
      map.set(pathname, page);
    }
  }
  return Array.from(map.values());
}
