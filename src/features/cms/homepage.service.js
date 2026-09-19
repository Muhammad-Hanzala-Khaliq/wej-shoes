import prisma from "@/lib/db";

/**
 * Get active homepage content blocks (public)
 * @returns {Promise<Array>} Active content blocks ordered by sortOrder
 */
export async function getActiveHomepageContent() {
  return prisma.homepageContent.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Get hero content for homepage (public)
 * @returns {Promise<Object|null>} Hero content block
 */
export async function getHeroContent() {
  return prisma.homepageContent.findFirst({
    where: { sectionType: "HERO", isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Get child categories with preview images for homepage (public)
 * @returns {Promise<Array>} Categories with displayImage
 */
export async function getHomepageCategories() {
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE", deletedAt: null, parentId: { not: null } },
    include: {
      products: {
        where: { status: "ACTIVE", deletedAt: null },
        take: 1,
        select: {
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { imageUrl: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
    take: 100,
  });

  return categories.map((cat) => ({
    ...cat,
    displayImage:
      cat.imageUrl ||
      cat.products?.[0]?.images?.[0]?.imageUrl ||
      null,
  }));
}

/**
 * Get featured products for homepage (public)
 * @returns {Promise<Array>} Featured products
 */
export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, status: "ACTIVE", deletedAt: null },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, isPrimary: true },
      },
      category: { select: { name: true } },
      variants: {
        where: { deletedAt: null, status: "ACTIVE" },
        select: { id: true, size: true, stockQuantity: true },
      },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get new arrivals for homepage (public)
 * @returns {Promise<Array>} New arrival products
 */
export async function getNewArrivals() {
  return prisma.product.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, imageUrl: true, isPrimary: true },
      },
      category: { select: { name: true } },
      variants: {
        where: { deletedAt: null, status: "ACTIVE" },
        select: { id: true, size: true, stockQuantity: true },
      },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}
