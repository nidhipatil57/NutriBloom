import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@nutribloom.com";
  const name = "Demo User";
  const password = "demopassword";

  console.log(`Checking if demo user ${email} exists...`);
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    console.log("Demo user already exists. Updating password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    console.log("Password updated successfully.");
    return;
  }

  console.log("Creating demo user...");
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    }
  });

  console.log("Creating default goal...");
  await prisma.goal.create({
    data: {
      userId: user.id,
      calorieTarget: 2000,
      proteinTarget: 150,
      carbTarget: 250,
      fatTarget: 65,
      dietType: "balanced",
      waterTargetMl: 2500,
    }
  });

  console.log("Creating default preference...");
  await prisma.userPreference.create({
    data: {
      userId: user.id,
      cuisines: "[]",
      allergies: "[]",
      dislikedIngredients: "[]",
      maxPrepTime: 60,
    }
  });

  console.log("Demo user seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
