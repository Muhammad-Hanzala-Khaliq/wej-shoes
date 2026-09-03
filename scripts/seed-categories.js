import prisma from "../src/lib/db.js";

async function seedCategories() {
  console.log("🌱 Seeding categories...");

  // Pehle existing categories check karein
  const existingCount = await prisma.category.count();
  if (existingCount > 0) {
    console.log(`⚠️  Already ${existingCount} categories exist. Skipping seed.`);
    console.log("💡 Agar dobara seed karna hai toh pehle categories delete karein.");
    return;
  }

  // Top-level categories create karein
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

  // Men subcategories
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

  // Women subcategories
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

  console.log("✅ Categories seeded successfully!");
  console.log("📊 Total: 10 categories (2 top-level + 8 subcategories)");
}

seedCategories()
  .catch((error) => {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });