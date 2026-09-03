import prisma from "@/lib/db";

/**
 * Generate unique order number
 * @returns {string} Order number in format ORD-timestamp-random
 */
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create a new order from cart items
 * Works for both logged-in users and guests
 * @param {Object} params
 * @param {string} [params.userId] - User ID (null for guests)
 * @param {string} params.sessionId - Session ID for guests
 * @param {Object} params.shippingAddress - Shipping address
 * @param {string} params.shippingAddress.fullName
 * @param {string} params.shippingAddress.phone
 * @param {string} [params.shippingAddress.email]
 * @param {string} params.shippingAddress.addressLine1
 * @param {string} [params.shippingAddress.addressLine2]
 * @param {string} params.shippingAddress.city
 * @param {string} params.shippingAddress.province
 * @param {string} [params.shippingAddress.postalCode]
 * @param {string} [params.notes] - Order notes
 * @returns {Promise<Object>} Created order
 */
export async function createOrder({ userId, sessionId, shippingAddress, notes }) {
  if (!userId && !sessionId) {
    throw new Error("userId or sessionId is required");
  }

  // Get cart with items
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  regularPrice: true,
                  salePrice: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Validate all variants are in stock and active
  for (const item of cart.items) {
    const { variant } = item;
    if (variant.deletedAt) {
      throw new Error(`Variant ${variant.sku} is no longer available`);
    }
    if (variant.status !== "ACTIVE") {
      throw new Error(`Variant ${variant.sku} is not active`);
    }
    if (variant.product.deletedAt) {
      throw new Error(`Product ${variant.product.name} is no longer available`);
    }
    if (variant.product.status !== "ACTIVE") {
      throw new Error(`Product ${variant.product.name} is not active`);
    }
    if (variant.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${variant.product.name} (${variant.color}/${variant.size}). Available: ${variant.stockQuantity}`);
    }
  }

  // Calculate totals
  let subtotal = 0;
  const orderItemsData = [];

  for (const item of cart.items) {
    const { variant } = item;
    const regularPrice = Number(variant.product.regularPrice);
    const salePrice = variant.product.salePrice ? Number(variant.product.salePrice) : null;
    const unitPrice = salePrice && salePrice < regularPrice ? salePrice : regularPrice;
    const lineTotal = unitPrice * item.quantity;

    subtotal += lineTotal;

    orderItemsData.push({
      productId: variant.product.id,
      variantId: variant.id,
      productName: variant.product.name,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      unitPrice,
      quantity: item.quantity,
      totalPrice: lineTotal,
    });
  }

  const shippingFee = subtotal >= 5000 ? 0 : 200;
  const totalAmount = subtotal + shippingFee;
  const orderNumber = generateOrderNumber();

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerFirstName: shippingAddress.fullName.split(" ")[0] || shippingAddress.fullName,
        customerLastName: shippingAddress.fullName.split(" ").slice(1).join(" ") || "",
        customerPhone: shippingAddress.phone,
        customerEmail: shippingAddress.email || "",
        city: shippingAddress.city,
        area: shippingAddress.province,
        address: [shippingAddress.addressLine1, shippingAddress.addressLine2].filter(Boolean).join(", "),
        notes: notes || null,
        subtotal,
        shippingFee,
        totalAmount,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
      },
    });

    // Create order items
    await tx.orderItem.createMany({
      data: orderItemsData.map((item) => ({
        orderId: newOrder.id,
        ...item,
      })),
    });

    // Create initial status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: newOrder.id,
        status: "PENDING",
        notes: "Order placed",
        createdBy: userId || "guest",
      },
    });

    // Update variant stock and record inventory history
    for (const item of cart.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      const previousQuantity = variant.stockQuantity;
      const newQuantity = previousQuantity - item.quantity;

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stockQuantity: newQuantity },
      });

      await tx.inventoryHistory.create({
        data: {
          variantId: item.variantId,
          previousQuantity,
          changeQuantity: -item.quantity,
          newQuantity,
          reason: "ORDER",
          referenceType: "ORDER",
          referenceId: newOrder.id,
          createdBy: userId || "guest",
        },
      });
    }

    // Clear the cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return newOrder;
  });

  // Return order with items
  return prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: true,
    },
  });
}

/**
 * Get order by order number
 * @param {string} orderNumber
 * @returns {Promise<Object|null>} Order or null
 */
export async function getOrderByOrderNumber(orderNumber) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

/**
 * Get order by ID with optional user validation
 * @param {string} orderId
 * @param {string} [userId] - If provided, validates order belongs to user
 * @returns {Promise<Object|null>} Order or null
 */
export async function getOrderById(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) return null;

  // If userId provided, validate ownership (skip for guest orders)
  if (userId && order.userId && order.userId !== userId) {
    return null;
  }

  return order;
}

/**
 * Get all orders for a user with pagination
 * @param {string} userId
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @returns {Promise<Object>} Orders with pagination info
 */
export async function getOrdersByUserId(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({
      where: { userId },
    }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Cancel an order
 * @param {string} orderId
 * @param {string} [userId] - User ID for validation
 * @param {string} [reason] - Cancellation reason
 * @returns {Promise<Object>} Updated order
 */
export async function cancelOrder(orderId, userId, reason) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Validate ownership if userId provided
  if (userId && order.userId && order.userId !== userId) {
    throw new Error("Order not found");
  }

  // Validate status allows cancellation
  if (!["PENDING", "CONFIRMED"].includes(order.orderStatus)) {
    throw new Error(`Cannot cancel order with status: ${order.orderStatus}`);
  }

  // Cancel order and restore stock in transaction
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Update order status
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "CANCELLED",
        paymentStatus: "CANCELLED",
      },
    });

    // Add status history
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "CANCELLED",
        notes: reason || "Cancelled by customer",
        createdBy: userId || "guest",
      },
    });

    // Restore variant stock
    for (const item of order.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (variant) {
        const previousQuantity = variant.stockQuantity;
        const newQuantity = previousQuantity + item.quantity;

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: newQuantity },
        });

        await tx.inventoryHistory.create({
          data: {
            variantId: item.variantId,
            previousQuantity,
            changeQuantity: item.quantity,
            newQuantity,
            reason: "ORDER_CANCELLED",
            referenceType: "ORDER",
            referenceId: orderId,
            createdBy: userId || "guest",
          },
        });
      }
    }

    return updated;
  });

  return prisma.order.findUnique({
    where: { id: updatedOrder.id },
    include: { items: true },
  });
}
