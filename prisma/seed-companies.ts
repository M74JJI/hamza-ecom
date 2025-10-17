import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.deliveryCompany.createMany({
    data: [
      { name: 'Amana Express', priceMAD: 35.00, avgDays: 2 },
      { name: 'Aramex Morocco', priceMAD: 40.00, avgDays: 3 },
      { name: 'Jumia Logistics', priceMAD: 30.00, avgDays: 2 },
    ]
  });
}

main()
  .then(() => console.log('✅ Delivery companies seeded'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
