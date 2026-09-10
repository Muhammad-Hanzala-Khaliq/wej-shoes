import prisma from "@/lib/db";

export async function generateUniqueSlug(baseSlug, modelName, excludeId = null) {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const where = { slug };
    if (excludeId) where.id = { not: excludeId };

    const existing = await prisma[modelName].findFirst({ where, select: { id: true } });

    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;

    if (counter > 100) {
      throw new Error("Slug generation failed: too many duplicates");
    }
  }
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
