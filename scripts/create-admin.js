import prisma from "../src/lib/db.js";
import bcrypt from "bcryptjs";

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@wejshoes.com" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists!");
      console.log("Email: admin@wejshoes.com");
      console.log("Password: admin123");
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 12);

    const admin = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@wejshoes.com",
        phone: "03001234567",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@wejshoes.com");
    console.log("Password: admin123");
    console.log("User ID:", admin.id);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();