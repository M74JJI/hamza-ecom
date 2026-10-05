import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 5_000,
  }),
});

async function main() {
  await prisma.deliveryCompany.createMany({
    data: [
      { name: "Amana Express", priceMAD: 35.0, avgDays: 2 },
      { name: "Aramex Morocco", priceMAD: 40.0, avgDays: 3 },
      { name: "Jumia Logistics", priceMAD: 30.0, avgDays: 2 },
    ],
  });
}

main()
  .then(() => console.log("Delivery companies seeded"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
