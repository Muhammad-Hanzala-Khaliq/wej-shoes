import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedCategories() {
  console.log("Seeding categories...");

  const existingCount = await prisma.category.count();
  if (existingCount > 0) {
    console.log(`  Already ${existingCount} categories exist. Skipping.`);
    return;
  }

  const menCategory = await prisma.category.create({
    data: {
      name: "Men",
      slug: "men",
      gender: "MEN",
      status: "ACTIVE",
    },
  });

  const womenCategory = await prisma.category.create({
    data: {
      name: "Women",
      slug: "women",
      gender: "WOMEN",
      status: "ACTIVE",
    },
  });

  const kidsCategory = await prisma.category.create({
    data: {
      name: "Kids",
      slug: "kids",
      gender: "KIDS",
      status: "ACTIVE",
    },
  });

  await prisma.category.createMany({
    data: [
      {
        name: "Sneakers",
        slug: "men-sneakers",
        gender: "MEN",
        parentId: menCategory.id,
        status: "ACTIVE",
      },
      {
        name: "Loafers",
        slug: "men-loafers",
        gender: "MEN",
        parentId: menCategory.id,
        status: "ACTIVE",
      },
      {
        name: "Sandals",
        slug: "men-sandals",
        gender: "MEN",
        parentId: menCategory.id,
        status: "ACTIVE",
      },
      {
        name: "Formal Shoes",
        slug: "men-formal",
        gender: "MEN",
        parentId: menCategory.id,
        status: "ACTIVE",
      },
    ],
  });

  await prisma.category.createMany({
    data: [
      {
        name: "Heels",
        slug: "women-heels",
        gender: "WOMEN",
        parentId: womenCategory.id,
        status: "ACTIVE",
      },
      {
        name: "Flats",
        slug: "women-flats",
        gender: "WOMEN",
        parentId: womenCategory.id,
        status: "ACTIVE",
      },
      {
        name: "Sandals",
        slug: "women-sandals",
        gender: "WOMEN",
        parentId: womenCategory.id,
        status: "ACTIVE",
      },
      {
        name: "Khusa",
        slug: "women-khusa",
        gender: "WOMEN",
        parentId: womenCategory.id,
        status: "ACTIVE",
      },
    ],
  });

  await prisma.category.createMany({
    data: [
      {
        name: "School Shoes",
        slug: "kids-school",
        gender: "KIDS",
        parentId: kidsCategory.id,
        status: "ACTIVE",
      },
      {
        name: "Sports Shoes",
        slug: "kids-sports",
        gender: "KIDS",
        parentId: kidsCategory.id,
        status: "ACTIVE",
      },
    ],
  });

  console.log("  Categories seeded successfully!");
  console.log("  Total: 13 categories (3 top-level + 10 subcategories)");
  return { menCategory, womenCategory, kidsCategory };
}

async function seedAdminUser() {
  console.log("Seeding admin user...");

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log(`  Admin user already exists (${existingAdmin.email}). Skipping.`);
    return existingAdmin;
  }

  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@wejshoes.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@wejshoes.com",
      phone: "03001234567",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("  Admin user seeded: admin@wejshoes.com / Admin123!");
  return admin;
}

async function seedProducts(categories) {
  console.log("Seeding products...");

  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log(`  Already ${existingProducts} products exist. Skipping.`);
    return;
  }

  const menSneakers = await prisma.category.findUnique({
    where: { slug: "men-sneakers" },
  });
  const womenFlats = await prisma.category.findUnique({
    where: { slug: "women-flats" },
  });
  const womenKhusa = await prisma.category.findUnique({
    where: { slug: "women-khusa" },
  });

  const categoryId = menSneakers?.id || categories?.menCategory?.id;
  const womenCategoryId = womenFlats?.id || categories?.womenCategory?.id;

  const product1 = await prisma.product.create({
    data: {
      categoryId,
      name: "TrailRunner Black",
      slug: "trailrunner-black",
      description:
        "Durable trail running shoe with superior grip and cushioned support for everyday adventures.",
      regularPrice: 5990,
      status: "ACTIVE",
      isFeatured: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: product1.id,
        sku: "TRB-40",
        color: "Black",
        size: "40",
        stockQuantity: 15,
        status: "ACTIVE",
      },
      {
        productId: product1.id,
        sku: "TRB-41",
        color: "Black",
        size: "41",
        stockQuantity: 10,
        status: "ACTIVE",
      },
      {
        productId: product1.id,
        sku: "TRB-42",
        color: "Black",
        size: "42",
        stockQuantity: 8,
        status: "ACTIVE",
      },
    ],
  });

  const product2 = await prisma.product.create({
    data: {
      categoryId: womenCategoryId,
      name: "UrbanFlex White",
      slug: "urbanflex-white",
      description:
        "Lightweight and flexible casual shoe designed for all-day comfort on city streets.",
      regularPrice: 4990,
      salePrice: 3990,
      status: "ACTIVE",
      isFeatured: true,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: product2.id,
        sku: "UFW-36",
        color: "White",
        size: "36",
        stockQuantity: 12,
        status: "ACTIVE",
      },
      {
        productId: product2.id,
        sku: "UFW-37",
        color: "White",
        size: "37",
        stockQuantity: 20,
        status: "ACTIVE",
      },
      {
        productId: product2.id,
        sku: "UFW-38",
        color: "White",
        size: "38",
        stockQuantity: 18,
        status: "ACTIVE",
      },
    ],
  });

  const product3 = await prisma.product.create({
    data: {
      categoryId: womenCategoryId,
      name: "ClassicStep Brown",
      slug: "classicstep-brown",
      description:
        "Elegant everyday flat with premium finish, perfect for work and casual outings.",
      regularPrice: 3490,
      status: "ACTIVE",
      isFeatured: false,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: product3.id,
        sku: "CSB-36",
        color: "Brown",
        size: "36",
        stockQuantity: 25,
        status: "ACTIVE",
      },
      {
        productId: product3.id,
        sku: "CSB-37",
        color: "Brown",
        size: "37",
        stockQuantity: 22,
        status: "ACTIVE",
      },
    ],
  });

  console.log("  3 sample products seeded with variants.");
  return [product1, product2, product3];
}

async function seedSampleOrder(products, admin) {
  console.log("Seeding sample order...");

  const existingOrders = await prisma.order.count();
  if (existingOrders > 0) {
    console.log(`  Already ${existingOrders} orders exist. Skipping.`);
    return;
  }

  if (!products || products.length < 2) {
    console.log("  Not enough products to create order. Skipping.");
    return;
  }

  const product1Variants = await prisma.productVariant.findMany({
    where: { productId: products[0].id },
    take: 1,
  });
  const product2Variants = await prisma.productVariant.findMany({
    where: { productId: products[1].id },
    take: 1,
  });

  if (!product1Variants.length || !product2Variants.length) {
    console.log("  No variants found. Skipping order seed.");
    return;
  }

  const v1 = product1Variants[0];
  const v2 = product2Variants[0];

  const order = await prisma.order.create({
    data: {
      orderNumber: "ORD-SEED-001",
      userId: admin?.id || null,
      customerFirstName: "Test",
      customerLastName: "Customer",
      customerPhone: "03001234567",
      customerEmail: "test@example.com",
      city: "Faisalabad",
      area: "D Ground",
      address: "123 Main Street, D Ground, Faisalabad",
      notes: "Sample order for testing",
      subtotal: 9980,
      shippingFee: 0,
      totalAmount: 9980,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order.id,
        productId: products[0].id,
        variantId: v1.id,
        productName: products[0].name,
        sku: v1.sku,
        color: v1.color,
        size: v1.size,
        unitPrice: products[0].regularPrice,
        quantity: 1,
        totalPrice: products[0].regularPrice,
      },
      {
        orderId: order.id,
        productId: products[1].id,
        variantId: v2.id,
        productName: products[1].name,
        sku: v2.sku,
        color: v2.color,
        size: v2.size,
        unitPrice: products[1].salePrice || products[1].regularPrice,
        quantity: 1,
        totalPrice: products[1].salePrice || products[1].regularPrice,
      },
    ],
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "PENDING",
      notes: "Order created via seed script",
      createdBy: "seed",
    },
  });

  console.log(`  Sample order seeded: ${order.orderNumber}`);
}

async function main() {
  console.log("=== WEJ Shoes Seed Script ===\n");

  const categories = await seedCategories();
  const admin = await seedAdminUser();
  const products = await seedProducts(categories);
  await seedSampleOrder(products, admin);

  console.log("\nSeed complete!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
