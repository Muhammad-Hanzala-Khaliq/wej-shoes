import prisma from "@/lib/db";
import { generateSlug } from "@/lib/utils";

/**
 * Get all categories with optional filters
 * @param {Object} options - Filter options
 * @param {string} [options.status] - Filter by status (default: ACTIVE)
 * @param {string} [options.gender] - Filter by gender (MEN/WOMEN)
 * @param {boolean} [options.includeDeleted=false] - Include soft deleted
 * @returns {Promise<Array>} List of categories
 */
export async function getCategories(options = {}) {
  const { status = "ACTIVE", gender, includeDeleted = false } = options;

  const where = {};

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (status) {
    where.status = status;
  }

  if (gender) {
    where.gender = gender;
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories;
}

/**
 * Get single category by slug
 * @param {string} slug
 * @returns {Promise<Object|null>} Category or null
 */
export async function getCategoryBySlug(slug) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!category || category.deletedAt) {
    return null;
  }

  return category;
}

/**
 * Get single category by id
 * @param {string} id
 * @returns {Promise<Object|null>} Category or null
 */
export async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!category || category.deletedAt) {
    return null;
  }

  return category;
}

/**
 * Create new category
 * @param {Object} data
 * @param {string} data.name - Category name (required)
 * @param {string} data.gender - Gender: MEN or WOMEN (required)
 * @param {string} [data.slug] - Custom slug (auto-generated if empty)
 * @param {string} [data.parentId] - Parent category id
 * @param {string} [data.imageUrl] - Image URL
 * @param {string} [data.status="ACTIVE"] - Status
 * @returns {Promise<Object>} Created category
 */
export async function createCategory(data) {
  const { name, gender, slug, parentId, imageUrl, status } = data;

  if (!name || !gender) {
    throw new Error("Name and gender are required");
  }

  if (!["MEN", "WOMEN"].includes(gender)) {
    throw new Error("Gender must be MEN or WOMEN");
  }

  const categorySlug = slug || generateSlug(name);

  const existingSlug = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (existingSlug) {
    throw new Error("A category with this slug already exists");
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug: categorySlug,
      gender,
      parentId: parentId || null,
      imageUrl: imageUrl || null,
      status: status || "ACTIVE",
    },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return category;
}

/**
 * Update existing category
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>} Updated category
 */
export async function updateCategory(id, data) {
  const { name, gender, slug, parentId, imageUrl, status } = data;

  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing || existing.deletedAt) {
    throw new Error("Category not found");
  }

  if (slug && slug !== existing.slug) {
    const slugExists = await prisma.category.findUnique({
      where: { slug },
    });

    if (slugExists && slugExists.id !== id) {
      throw new Error("A category with this slug already exists");
    }
  }

  const categorySlug = slug || (name ? generateSlug(name) : existing.slug);

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: name || existing.name,
      slug: categorySlug,
      gender: gender || existing.gender,
      parentId: parentId !== undefined ? parentId : existing.parentId,
      imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
      status: status || existing.status,
    },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return category;
}

/**
 * Soft delete category
 * @param {string} id
 * @returns {Promise<Object>} Deleted category
 */
export async function deleteCategory(id) {
  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing || existing.deletedAt) {
    throw new Error("Category not found");
  }

  const category = await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return category;
}

/**
 * Restore soft deleted category
 * @param {string} id
 * @returns {Promise<Object>} Restored category
 */
export async function restoreCategory(id) {
  const existing = await prisma.category.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Category not found");
  }

  const category = await prisma.category.update({
    where: { id },
    data: { deletedAt: null },
  });

  return category;
}
