import prisma from "@/lib/db";

/**
 * Get store settings (creates defaults if none exist)
 * @returns {Promise<Object>} Store settings
 */
export async function getStoreSettings() {
  let settings = await prisma.storeSettings.findFirst();

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: {
        storeName: "WEJ Shoes",
        currency: "PKR",
        codEnabled: true,
      },
    });
  }

  return settings;
}

/**
 * Update store settings
 * @param {Object} data - Settings data
 * @param {string} [data.storeName]
 * @param {string} [data.logoUrl]
 * @param {string} [data.supportEmail]
 * @param {string} [data.phone]
 * @param {string} [data.whatsappNumber]
 * @param {string} [data.currency]
 * @param {boolean} [data.codEnabled]
 * @returns {Promise<Object>} Updated settings
 */
export async function updateStoreSettings(data) {
  const existing = await prisma.storeSettings.findFirst();

  if (existing) {
    return prisma.storeSettings.update({
      where: { id: existing.id },
      data: {
        storeName: data.storeName ?? undefined,
        logoUrl: data.logoUrl ?? undefined,
        supportEmail: data.supportEmail ?? undefined,
        phone: data.phone ?? undefined,
        whatsappNumber: data.whatsappNumber ?? undefined,
        currency: data.currency ?? undefined,
        codEnabled: data.codEnabled ?? undefined,
      },
    });
  }

  return prisma.storeSettings.create({
    data: {
      storeName: data.storeName || "WEJ Shoes",
      logoUrl: data.logoUrl || null,
      supportEmail: data.supportEmail || null,
      phone: data.phone || null,
      whatsappNumber: data.whatsappNumber || null,
      currency: data.currency || "PKR",
      codEnabled: data.codEnabled ?? true,
    },
  });
}

/**
 * Get active homepage content blocks
 * @returns {Promise<Array>} Active content blocks ordered by sortOrder
 */
export async function getHomepageContent() {
  return prisma.homepageContent.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Get all homepage content blocks (admin)
 * @returns {Promise<Array>} All content blocks ordered by sortOrder
 */
export async function getAllHomepageContent() {
  return prisma.homepageContent.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Create a new homepage content block
 * @param {Object} data
 * @param {string} data.sectionType
 * @param {string} [data.title]
 * @param {string} [data.subtitle]
 * @param {string} [data.imageUrl]
 * @param {string} [data.buttonText]
 * @param {string} [data.buttonUrl]
 * @param {boolean} [data.isActive]
 * @returns {Promise<Object>} Created content
 */
export async function createHomepageContent(data) {
  const maxSort = await prisma.homepageContent.aggregate({
    _max: { sortOrder: true },
  });

  const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

  return prisma.homepageContent.create({
    data: {
      sectionType: data.sectionType,
      title: data.title || null,
      subtitle: data.subtitle || null,
      imageUrl: data.imageUrl || null,
      buttonText: data.buttonText || null,
      buttonUrl: data.buttonUrl || null,
      sortOrder: data.sortOrder ?? nextSort,
      isActive: data.isActive ?? true,
    },
  });
}

/**
 * Update a homepage content block
 * @param {string} id - Content ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated content
 */
export async function updateHomepageContent(id, data) {
  const existing = await prisma.homepageContent.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Content not found");
  }

  return prisma.homepageContent.update({
    where: { id },
    data: {
      sectionType: data.sectionType ?? undefined,
      title: data.title !== undefined ? data.title : undefined,
      subtitle: data.subtitle !== undefined ? data.subtitle : undefined,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
      buttonText: data.buttonText !== undefined ? data.buttonText : undefined,
      buttonUrl: data.buttonUrl !== undefined ? data.buttonUrl : undefined,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : undefined,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
    },
  });
}

/**
 * Delete a homepage content block
 * @param {string} id - Content ID
 * @returns {Promise<Object>} Success message
 */
export async function deleteHomepageContent(id) {
  const existing = await prisma.homepageContent.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Content not found");
  }

  await prisma.homepageContent.delete({ where: { id } });
  return { message: "Content deleted successfully" };
}

/**
 * Get all shipping rules (creates default if none exist)
 * @returns {Promise<Array>} Shipping rules
 */
export async function getShippingRules() {
  const rules = await prisma.shippingRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (rules.length === 0) {
    const defaultRule = await prisma.shippingRule.create({
      data: {
        name: "Standard Delivery",
        type: "FLAT",
        amount: 200,
        freeShippingThreshold: 5000,
        isActive: true,
      },
    });
    return [defaultRule];
  }

  return rules;
}

/**
 * Update a shipping rule
 * @param {string} id - Rule ID
 * @param {Object} data - Update data
 * @param {string} [data.name]
 * @param {string} [data.type]
 * @param {number} [data.amount]
 * @param {number} [data.freeShippingThreshold]
 * @param {boolean} [data.isActive]
 * @returns {Promise<Object>} Updated rule
 */
export async function updateShippingRule(id, data) {
  const existing = await prisma.shippingRule.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Shipping rule not found");
  }

  return prisma.shippingRule.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      type: data.type ?? undefined,
      amount: data.amount !== undefined ? data.amount : undefined,
      freeShippingThreshold: data.freeShippingThreshold !== undefined ? data.freeShippingThreshold : undefined,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
    },
  });
}

/**
 * Reorder homepage content blocks
 * @param {Array<{id: string, sortOrder: number}>} orderArray - Array of {id, sortOrder}
 * @returns {Promise<Array>} Updated content blocks
 */
export async function reorderHomepageContent(orderArray) {
  if (!orderArray || !Array.isArray(orderArray) || orderArray.length === 0) {
    throw new Error("orderArray must be a non-empty array");
  }

  await prisma.$transaction(
    orderArray.map((item) =>
      prisma.homepageContent.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  return getAllHomepageContent();
}
