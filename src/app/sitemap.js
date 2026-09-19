import prisma from "@/lib/db";

const BASE_URL = process.env.NEXTAUTH_URL || "https://wejshoes.com";

export default async function sitemap() {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/collections/men`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/collections/women`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/collections/kids`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/policies/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/policies/returns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/track-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
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
    return staticPages;
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

  return [...staticPages, ...categoryPages, ...productPages];
}
