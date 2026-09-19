import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Create a new user (signup)
 * @param {Object} data
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} [data.phone]
 * @param {string} data.password
 * @returns {Promise<Object>} Created user { id }
 */
export async function createUser({ firstName, lastName, email, phone, password }) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone: phone || null,
      passwordHash,
      role: "USER",
      status: "ACTIVE",
    },
  });

  return { id: user.id };
}

/**
 * Get account data for a user (dashboard stats + recent orders)
 * @param {string} userId
 * @returns {Promise<Object>} Account data
 */
export async function getAccountData(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [recentOrders, totalOrders, orderStats] = await Promise.all([
    prisma.order.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        orderStatus: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({
      where: { userId, deletedAt: null },
    }),
    prisma.order.aggregate({
      where: { userId, deletedAt: null },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalSpent = Number(orderStats._sum.totalAmount || 0);

  const memberSince = new Date(user.createdAt);
  const now = new Date();
  const diffMs = now - memberSince;
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  const memberDuration =
    diffMonths >= 12
      ? `${Math.floor(diffMonths / 12)} year${Math.floor(diffMonths / 12) > 1 ? "s" : ""}`
      : `${diffMonths || 1} month${diffMonths !== 1 ? "s" : ""}`;

  return {
    user: {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      createdAt: user.createdAt,
    },
    recentOrders: recentOrders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
    })),
    stats: {
      totalOrders,
      totalSpent,
      memberDuration,
    },
  };
}

/**
 * Generate a password reset token for a user
 * @param {string} email
 * @returns {Promise<{ token: string, email: string }>}
 */
export async function generatePasswordResetToken(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { token: null, email: null };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = await bcrypt.hash(rawToken, 10);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  return { token: rawToken, email: user.email };
}

/**
 * Reset a user's password using a valid token
 * @param {string} token - Raw token from the URL
 * @param {string} newPassword
 * @returns {Promise<{ success: boolean }>}
 */
export async function resetPasswordWithToken(token, newPassword) {
  try {
    const tokens = await prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
    });

    for (const record of tokens) {
      let isValid = false;
      try {
        isValid = await bcrypt.compare(token, record.tokenHash);
      } catch {
        continue;
      }
      if (!isValid) continue;

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });

      await prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      return { success: true };
    }

    return { success: false };
  } catch (error) {
    logError("resetPasswordWithToken", error);
    throw error;
  }
}
