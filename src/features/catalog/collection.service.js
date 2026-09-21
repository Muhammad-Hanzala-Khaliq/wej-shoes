import prisma from "@/lib/db";

/**
 * Get collection metadata by slug
 * @param {string} slug
 * @returns {Promise<Object|null>} { gender, categorySlug, title, description }
 */
export async function getCollectionInfo(slug) {
  if (slug === "men") {
    return { gender: "MEN", categorySlug: null, title: "Men", description: "Premium footwear for men" };
  }
  if (slug === "women") {
    return { gender: "WOMEN", categorySlug: null, title: "Women", description: "Premium footwear for women" };
  }
  if (slug === "kids") {
    return { gender: "KIDS", categorySlug: null, title: "Kids", description: "Fun & comfortable footwear for little ones" };
  }
  if (slug === "new") {
    return { gender: null, categorySlug: null, title: "New Arrivals", description: "Latest additions to our collection" };
  }

  const category = await prisma.category.findUnique({
    where: { slug, deletedAt: null },
    select: { name: true, gender: true },
  });

  if (category) {
    return {
      gender: category.gender,
      categorySlug: slug,
      title: category.name.toUpperCase(),
      description: `Shop ${category.name} footwear`,
    };
  }

  return null;
}

/**
 * Compute the effective selling price for a product.
 * Returns salePrice if set, otherwise regularPrice.
 */
function getEffectivePrice(product) {
  if (product.salePrice != null && Number(product.salePrice) < Number(product.regularPrice)) {
    return Number(product.salePrice);
  }
  return Number(product.regularPrice);
}

/**
 * Build the Prisma WHERE clause for collection products.
 */
function buildWhereClause({ gender, categorySlug, minPrice, maxPrice, colors, sizes, inStock }) {
  const where = {
    status: "ACTIVE",
    deletedAt: null,
  };

  if (gender) {
    where.category = { gender };
  }

  if (categorySlug) {
    where.category = { ...where.category, slug: categorySlug };
  }

  if (minPrice !== undefined && minPrice !== null) {
    where.OR = [
      { regularPrice: { gte: parseFloat(minPrice) } },
      { salePrice: { gte: parseFloat(minPrice) } },
    ];
  }

  if (maxPrice !== undefined && maxPrice !== null) {
    if (where.OR) {
      where.AND = [
        { OR: where.OR },
        {
          OR: [
            { regularPrice: { lte: parseFloat(maxPrice) } },
            { salePrice: { lte: parseFloat(maxPrice) } },
          ],
        },
      ];
      delete where.OR;
    } else {
      where.OR = [
        { regularPrice: { lte: parseFloat(maxPrice) } },
        { salePrice: { lte: parseFloat(maxPrice) } },
      ];
    }
  }

  const variantConditions = [];

  if (colors && colors.length > 0) {
    variantConditions.push({
      some: { color: { in: colors }, deletedAt: null },
    });
  }

  if (sizes && sizes.length > 0) {
    variantConditions.push({
      some: { size: { in: sizes }, deletedAt: null },
    });
  }

  if (inStock) {
    variantConditions.push({
      some: { stockQuantity: { gt: 0 }, deletedAt: null },
    });
  }

  if (variantConditions.length === 1) {
    where.variants = variantConditions[0];
  } else if (variantConditions.length > 1) {
    where.AND = variantConditions.map((c) => ({ variants: c }));
  }

  return where;
}

const PRODUCT_INCLUDE = {
  images: {
    orderBy: { sortOrder: "asc" },
    select: { id: true, imageUrl: true, isPrimary: true },
  },
  category: {
    select: { id: true, name: true, slug: true, gender: true },
  },
  variants: {
    where: { deletedAt: null },
    select: { id: true, color: true, size: true, stockQuantity: true },
  },
};

/**
 * Get products for collection pages with filtering, sorting, and pagination.
 *
 * Price sorts (price-asc / price-desc) sort by the effective selling price
 * (salePrice when set, otherwise regularPrice). This is done via in-JS sort
 * on the full matching set to ensure correct interleaving of sale vs regular
 * products. For small-to-medium catalogs (< 500 products) this is performant.
 *
 * @param {Object} options
 * @returns {Promise<Object>} { products, total, page, totalPages }
 */
export async function getCollectionProducts(options = {}) {
  const {
    gender,
    categorySlug,
    page = 1,
    limit = 12,
    sort = "newest",
    minPrice,
    maxPrice,
    colors,
    sizes,
    inStock,
  } = options;

  const skip = (page - 1) * limit;
  const where = buildWhereClause({ gender, categorySlug, minPrice, maxPrice, colors, sizes, inStock });

  // --- Price sorts: fetch all, sort in JS, paginate ---
  if (sort === "price-asc" || sort === "price-desc") {
    const allProducts = await prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
    });

    const dir = sort === "price-asc" ? 1 : -1;

    allProducts.sort((a, b) => {
      const priceA = getEffectivePrice(a);
      const priceB = getEffectivePrice(b);
      return (priceA - priceB) * dir;
    });

    const total = allProducts.length;
    const products = allProducts.slice(skip, skip + limit);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // --- Non-price sorts: use Prisma orderBy directly ---
  let orderBy = {};
  switch (sort) {
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy,
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
 * Get available filter options for a collection
 * @param {string} [gender] - Filter by gender
 * @param {string} [categorySlug] - Filter by category slug
 * @returns {Promise<Object>} { colors, sizes, priceRange }
 */
export async function getAvailableFilters(gender, categorySlug) {
  const where = {
    status: "ACTIVE",
    deletedAt: null,
  };

  if (gender) {
    where.category = { gender };
  }

  if (categorySlug) {
    where.category = { ...where.category, slug: categorySlug };
  }

  const products = await prisma.product.findMany({
    where,
    select: {
      regularPrice: true,
      salePrice: true,
      variants: {
        where: { deletedAt: null },
        select: { color: true, size: true, stockQuantity: true },
      },
    },
  });

  const colorsSet = new Set();
  const sizesSet = new Set();
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  products.forEach((product) => {
    const price = getEffectivePrice(product);
    if (price < minPrice) minPrice = price;
    if (price > maxPrice) maxPrice = price;

    product.variants.forEach((variant) => {
      colorsSet.add(variant.color);
      sizesSet.add(variant.size);
    });
  });

  return {
    colors: Array.from(colorsSet).sort(),
    sizes: Array.from(sizesSet).sort(),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice === -Infinity ? 0 : maxPrice,
    },
  };
}
