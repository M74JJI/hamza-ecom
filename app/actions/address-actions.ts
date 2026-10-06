'use server';

import { prisma } from "@/lib/db";
import { AddressSchema } from "@/lib/z-schemas";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";

export async function addAddressAction(input: unknown){
  const { user } = await requireUser();
  const parsed = AddressSchema.safeParse(input);
  if(!parsed.success){
    return { error: "Invalid address" };
  }

  const a = parsed.data;
  const created = await prisma.address.create({
    data: {
      userId: user.id,
      fullName: a.fullName,
      phone: a.phone,
      city: a.city,
      fullAddress: a.streetAddress
    }
  });

  revalidatePath("/checkout");
  revalidatePath("/profile");
  return { ok: true, id: created.id };
}

export async function setDefaultAddressAction(id: string){
  const { user } = await requireUser();

  const result = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;

    const owned = await tx.address.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!owned) return { error: "Address not found" as const };

    await tx.address.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
        id: { not: owned.id },
      },
      data: { isDefault: false },
    });

    await tx.address.update({
      where: { id: owned.id },
      data: { isDefault: true },
    });

    return { ok: true as const };
  });

  if (!result.ok) return result;

  revalidatePath("/checkout");
  revalidatePath("/profile");
  return result;
}
