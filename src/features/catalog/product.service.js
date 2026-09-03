import prisma from "@/lib/db";
import { generateSlug } from "@/lib/utils";

/**
 * Get all products with pagination and filters
 * @param {Object} options - Filter options
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.categoryId] - Filter by category
 * @param {string} [options.gender] - Filter by gender (via category)
 * @param {boolean} [options.isFeatured] - Filter featured products
 * @param {string} [options.search] - Search in name/slug
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Items per page
 * @param {boolean} [options.includeDeleted=false] - Include soft deleted
 * @returns {Promise<Object>} { products, total, page, totalPages }
 */
export async function getProducts(options = {}) {
  const {
    status,
    categoryId,
    gender,
    isFeatured,
    search,
    page = 1,
    limit = 20,
    includeDeleted = false,
  } = options;

  const skip = (page - 1) * limit;

  const where = {};

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (gender) {
    where.category = { gender };
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true, gender: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { id: true, imageUrl: true },
        },
        variants: {
          where: { deletedAt: null },
          select: { id: true, stockQuantity: true },
        },
        _count: {
          select: { variants: true, images: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get single product by slug (public)
 * @param {string} slug
 * @returns {Promise<Object|null>} Product or null
 */
export async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true, gender: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        where: { deletedAt: null },
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
    },
  });

  if (!product || product.deletedAt || product.status !== "ACTIVE") {
    return null;
  }

  return product;
}

/**
 * Get single product by id (admin)
 * @param {string} id
 * @returns {Promise<Object|null>} Product or null
 */
export async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true, slug: true, gender: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        where: { deletedAt: null },
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
    },
  });

  if (!product || product.deletedAt) {
    return null;
  }

  return product;
}

/**
 * Create new product with variants and images
 * @param {Object} data
 * @param {string} data.name - Product name (required)
 * @param {string} data.categoryId - Category ID (required)
 * @param {number} data.regularPrice - Regular price (required)
 * @param {string} [data.slug] - Custom slug
 * @param {string} [data.description] - Product description
 * @param {number} [data.salePrice] - Sale price
 * @param {string} [data.status="DRAFT"] - Status
 * @param {boolean} [data.isFeatured=false] - Featured flag
 * @param {Array} [data.images] - Array of image objects
 * @param {Array} [data.variants] - Array of variant objects
 * @returns {Promise<Object>} Created product
 */
export async function createProduct(data) {
  const {
    name,
    categoryId,
    regularPrice,
    slug,
    description,
    salePrice,
    status,
    isFeatured,
    images = [],
    variants = [],
  } = data;

  if (!name || !categoryId || regularPrice === undefined) {
    throw new Error("Name, categoryId, and regularPrice are required");
  }

  const productSlug = slug || generateSlug(name);

  const existingSlug = await prisma.product.findUnique({
    where: { slug: productSlug },
  });

  if (existingSlug) {
    throw new Error("A product with this slug already exists");
  }

  const product = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name,
        slug: productSlug,
        categoryId,
        description: description || null,
        regularPrice: parseFloat(regularPrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        status: status || "DRAFT",
        isFeatured: isFeatured || false,
      },
    });

    if (images.length > 0) {
      await tx.productImage.createMany({
        data: images.map((img, index) => ({
          productId: newProduct.id,
          imageUrl: img.imageUrl,
          cloudinaryPublicId: img.cloudinaryPublicId || null,
          altText: img.altText || null,
          sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
          isPrimary: img.isPrimary || index === 0,
        })),
      });
    }

    if (variants.length > 0) {
      for (const variant of variants) {
        await tx.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            stockQuantity: variant.stockQuantity || 0,
            status: variant.status || "ACTIVE",
          },
        });
      }
    }

    return tx.product.findUnique({
      where: { id: newProduct.id },
      include: {
        category: {
          select: { id: true, name: true, slug: true, gender: true },
        },
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      },
    });
  });

  return product;
}

/**
 * Update existing product with variants and images
 * @param {string} id - Product ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated product
 */
export async function updateProduct(id, data) {
  const {
    name,
    categoryId,
    regularPrice,
    slug,
    description,
    salePrice,
    status,
    isFeatured,
    images,
    variants,
  } = data;

  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing || existing.deletedAt) {
    throw new Error("Product not found");
  }

  if (slug && slug !== existing.slug) {
    const slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists && slugExists.id !== id) {
      throw new Error("A product with this slug already exists");
    }
  }

  const productSlug = slug || (name ? generateSlug(name) : existing.slug);

  const product = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id },
      data: {
        name: name || existing.name,
        slug: productSlug,
        categoryId: categoryId || existing.categoryId,
        description: description !== undefined ? description : existing.description,
        regularPrice: regularPrice !== undefined ? parseFloat(regularPrice) : existing.regularPrice,
        salePrice: salePrice !== undefined ? (salePrice ? parseFloat(salePrice) : null) : existing.salePrice,
        status: status || existing.status,
        isFeatured: isFeatured !== undefined ? isFeatured : existing.isFeatured,
      },
    });

    if (images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } });

      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            productId: id,
            imageUrl: img.imageUrl,
            cloudinaryPublicId: img.cloudinaryPublicId || null,
            altText: img.altText || null,
            sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
            isPrimary: img.isPrimary || index === 0,
          })),
        });
      }
    }

    if (variants !== undefined) {
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id, deletedAt: null },
      });

      const existingIds = existingVariants.map((v) => v.id);
      const incomingIds = variants.filter((v) => v.id).map((v) => v.id);
      const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));

      if (toDelete.length > 0) {
        await tx.productVariant.updateMany({
          where: { id: { in: toDelete } },
          data: { deletedAt: new Date() },
        });
      }

      for (const variant of variants) {
        if (variant.id) {
          const existingVariant = existingVariants.find((v) => v.id === variant.id);
          if (existingVariant) {
            const stockChange = (variant.stockQuantity || 0) - existingVariant.stockQuantity;

            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                sku: variant.sku || existingVariant.sku,
                color: variant.color || existingVariant.color,
                size: variant.size || existingVariant.size,
                stockQuantity: variant.stockQuantity !== undefined ? variant.stockQuantity : existingVariant.stockQuantity,
                status: variant.status || existingVariant.status,
              },
            });

            if (stockChange !== 0) {
              await tx.inventoryHistory.create({
                data: {
                  variantId: variant.id,
                  previousQuantity: existingVariant.stockQuantity,
                  changeQuantity: stockChange,
                  newQuantity: variant.stockQuantity !== undefined ? variant.stockQuantity : existingVariant.stockQuantity,
                  reason: "Product update",
                  referenceType: "PRODUCT",
                  referenceId: id,
                },
              });
            }
          }
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
              stockQuantity: variant.stockQuantity || 0,
              status: variant.status || "ACTIVE",
            },
          });
        }
      }
    }

    return tx.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true, gender: true },
        },
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          where: { deletedAt: null },
          orderBy: [{ color: "asc" }, { size: "asc" }],
        },
      },
    });
  });

  return product;
}

/**
 * Soft delete product and all its variants
 * @param {string} id
 * @returns {Promise<Object>} Success message
 */
export async function deleteProduct(id) {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing || existing.deletedAt) {
    throw new Error("Product not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await tx.productVariant.updateMany({
      where: { productId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  });

  return { message: "Product deleted successfully" };
}

/**
 * Restore soft deleted product
 * @param {string} id
 * @returns {Promise<Object>} Success message
 */
export async function restoreProduct(id) {
  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Product not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: { deletedAt: null },
    });

    await tx.productVariant.updateMany({
      where: { productId: id },
      data: { deletedAt: null },
    });
  });

  return { message: "Product restored successfully" };
}

/**
 * Update variant stock and record inventory history
 * @param {string} variantId - Variant ID
 * @param {number} change - Stock change (positive or negative)
 * @param {string} reason - Reason for change
 * @param {string} [referenceId] - Related order/product ID
 * @param {string} [userId] - User who made the change
 * @returns {Promise<Object>} Updated variant
 */
export async function updateVariantStock(variantId, change, reason, referenceId, userId) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    throw new Error("Variant not found");
  }

  const newQuantity = variant.stockQuantity + change;

  if (newQuantity < 0) {
    throw new Error("Stock cannot be negative");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const v = await tx.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity: newQuantity },
    });

    await tx.inventoryHistory.create({
      data: {
        variantId,
        previousQuantity: variant.stockQuantity,
        changeQuantity: change,
        newQuantity,
        reason,
        referenceType: reason.includes("Order") ? "ORDER" : "ADJUSTMENT",
        referenceId: referenceId || null,
        createdBy: userId || null,
      },
    });

    return v;
  });

  return updated;
}
