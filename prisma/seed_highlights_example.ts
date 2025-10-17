import { prisma } from "@/lib/db";

export async function seedHighlights(productId: string) {
  await prisma.productHighlight.createMany({
    data: [
      { productId, label: "Water resistant", value: "Premium canvas & leather" },
      { productId, label: "Warranty", value: "2 years manufacturer warranty" },
    ],
  });
}
