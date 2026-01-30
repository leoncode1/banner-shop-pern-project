import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (safe for dev)
  await prisma.order.deleteMany();
  await prisma.addOn.deleteMany();
  await prisma.bannerOption.deleteMany();

  // Banner options
  await prisma.bannerOption.createMany({
    data: [
      {
        tier: "BASIC",
        widthFt: 5,
        heightFt: 3,
        basePrice: 3500,
        description: "Basic 5x3 hand-painted banner",
      },
      {
        tier: "STANDARD",
        widthFt: 5,
        heightFt: 3,
        basePrice: 5000,
        description: "Standard 5x3 hand-painted banner",
      },
      {
        tier: "PREMIUM",
        widthFt: 5,
        heightFt: 3,
        basePrice: 6500,
        description: "Premium 5x3 hand-painted banner",
      },
      {
        tier: "MINI",
        widthFt: 3,
        heightFt: 2,
        basePrice: 2000,
        description: "Mini 3x2 hand-painted banner",
      },
    ],
  });

  // Add-ons
  await prisma.addOn.createMany({
    data: [
      { name: "Extra Words", price: 300 },
      { name: "Characters", price: 1000 },
      { name: "Glitter", price: 500 },
      { name: "Grommets", price: 300 },
      { name: "Rush Order", price: 1000 },
      { name: "Matching-Mini", price: 1000 },
    ],
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
