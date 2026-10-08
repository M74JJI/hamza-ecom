import { prisma } from "../lib/db";

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();

if (!email) {
  console.log("ADMIN_BOOTSTRAP_EMAIL is not set; skipping admin bootstrap.");
} else {
  const result = await prisma.user.updateMany({
    where: { email: { equals: email, mode: "insensitive" } },
    data: { role: "ADMIN" },
  });

  if (result.count === 0) {
    throw new Error("Admin bootstrap user was not found. Create and verify the account before deploying.");
  }

  console.log(`Admin bootstrap complete for ${result.count} user.`);
}

await prisma.$disconnect();
