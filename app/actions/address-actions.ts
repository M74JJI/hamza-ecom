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
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } })
  ]);
  revalidatePath("/checkout");
  revalidatePath("/profile");
  return { ok: true };
}
