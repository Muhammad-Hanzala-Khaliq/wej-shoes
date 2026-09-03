import prisma from "@/lib/db";

/**
 * Get or create cart for user or guest
 * @param {Object} params
 * @param {string} [params.userId] - User ID (for logged-in users)
 * @param {string} [params.sessionId] - Session ID (for guests)
 * @returns {Promise<Object>} Cart with items
 */
export async function getOrCreateCart({ userId, sessionId }) {
  if (!userId && !sessionId) {
    throw new Error("userId or sessionId is required");
  }

  let cart;

  if (userId) {
    cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    regularPrice: true,
                    salePrice: true,
                    status: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                      select: { imageUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      regularPrice: true,
                      salePrice: true,
                      status: true,
                      images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { imageUrl: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }
  } else {
    cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    regularPrice: true,
                    salePrice: true,
                    status: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                      select: { imageUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      regularPrice: true,
                      salePrice: true,
                      status: true,
                      images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { imageUrl: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }
  }

  return cart;
}

/**
 * Get cart with calculated totals
 * @param {Object} params
 * @param {string} [params.userId] - User ID
 * @param {string} [params.sessionId] - Session ID
 * @returns {Promise<Object|null>} Cart data with totals
 */
export async function getCart({ userId, sessionId }) {
  const cart = await getOrCreateCart({ userId, sessionId });

  if (!cart) {
    return { items: [], subtotal: 0, itemCount: 0, cartId: null };
  }

  const items = cart.items
    .filter((item) => item.variant && item.variant.product && item.variant.product.status === "ACTIVE")
    .map((item) => {
      const product = item.variant.product;
      const regularPrice = Number(product.regularPrice);
      const salePrice = product.salePrice ? Number(product.salePrice) : null;
      const effectivePrice = salePrice && salePrice < regularPrice ? salePrice : regularPrice;
      const linePrice = effectivePrice * item.quantity;

      return {
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        effectivePrice,
        linePrice,
        variant: {
          id: item.variant.id,
          sku: item.variant.sku,
          color: item.variant.color,
          size: item.variant.size,
          stockQuantity: item.variant.stockQuantity,
        },
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          regularPrice,
          salePrice,
          image: product.images[0]?.imageUrl || null,
        },
      };
    });

  const subtotal = items.reduce((sum, item) => sum + item.linePrice, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartId: cart.id,
    items,
    subtotal,
    itemCount,
  };
}

/**
 * Add item to cart
 * @param {Object} params
 * @param {string} [params.userId] - User ID
 * @param {string} [params.sessionId] - Session ID
 * @param {string} params.variantId - Variant ID
 * @param {number} [params.quantity=1] - Quantity to add
 * @returns {Promise<Object>} Updated cart
 */
export async function addToCart({ userId, sessionId, variantId, quantity = 1 }) {
  if (!userId && !sessionId) {
    throw new Error("userId or sessionId is required");
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: {
        select: { status: true },
      },
    },
  });

  if (!variant || variant.deletedAt) {
    throw new Error("Product variant not found");
  }

  if (variant.status !== "ACTIVE" || variant.product.status !== "ACTIVE") {
    throw new Error("Product is not available");
  }

  if (variant.stockQuantity < quantity) {
    throw new Error("Insufficient stock");
  }

  const cart = await getOrCreateCart({ userId, sessionId });

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > variant.stockQuantity) {
      throw new Error("Insufficient stock");
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity,
      },
    });
  }

  return getCart({ userId, sessionId });
}

/**
 * Update cart item quantity
 * @param {Object} params
 * @param {string} [params.userId] - User ID
 * @param {string} [params.sessionId] - Session ID
 * @param {string} params.itemId - Cart item ID
 * @param {number} params.quantity - New quantity (0 to remove)
 * @returns {Promise<Object>} Updated cart
 */
export async function updateCartItemQuantity({ userId, sessionId, itemId, quantity }) {
  const cart = await getOrCreateCart({ userId, sessionId });

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { variant: true },
  });

  if (!item || item.cartId !== cart.id) {
    throw new Error("Cart item not found");
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    if (quantity > item.variant.stockQuantity) {
      throw new Error("Insufficient stock");
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  return getCart({ userId, sessionId });
}

/**
 * Remove item from cart
 * @param {Object} params
 * @param {string} [params.userId] - User ID
 * @param {string} [params.sessionId] - Session ID
 * @param {string} params.itemId - Cart item ID
 * @returns {Promise<Object>} Updated cart
 */
export async function removeCartItem({ userId, sessionId, itemId }) {
  const cart = await getOrCreateCart({ userId, sessionId });

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
  });

  if (!item || item.cartId !== cart.id) {
    throw new Error("Cart item not found");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return getCart({ userId, sessionId });
}

/**
 * Clear all items from cart
 * @param {Object} params
 * @param {string} [params.userId] - User ID
 * @param {string} [params.sessionId] - Session ID
 * @returns {Promise<Object>} Empty cart
 */
export async function clearCart({ userId, sessionId }) {
  const cart = await getOrCreateCart({ userId, sessionId });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return getCart({ userId, sessionId });
}

/**
 * Merge guest cart into user cart on login
 * @param {Object} params
 * @param {string} params.sessionId - Guest session ID
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Merged cart
 */
export async function mergeGuestCartToUser({ sessionId, userId }) {
  const guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) {
    return getCart({ userId, sessionId: null });
  }

  const userCart = await getOrCreateCart({ userId, sessionId: null });

  await prisma.$transaction(async (tx) => {
    for (const guestItem of guestCart.items) {
      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: userCart.id,
            variantId: guestItem.variantId,
          },
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + guestItem.quantity;

        const variant = await tx.productVariant.findUnique({
          where: { id: guestItem.variantId },
        });

        if (variant && newQuantity <= variant.stockQuantity) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });
        }
      } else {
        const variant = await tx.productVariant.findUnique({
          where: { id: guestItem.variantId },
        });

        if (variant && guestItem.quantity <= variant.stockQuantity) {
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              variantId: guestItem.variantId,
              quantity: guestItem.quantity,
            },
          });
        }
      }
    }

    await tx.cartItem.deleteMany({
      where: { cartId: guestCart.id },
    });

    await tx.cart.delete({
      where: { id: guestCart.id },
    });
  });

  return getCart({ userId, sessionId: null });
}
