'use server';

import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { z } from 'zod';

const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(3),
  city: z.string().min(1),
  fullAddress: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export async function createAddress(input: unknown) {
  const { user } = await requireUser();
  const data = addressSchema.parse(input);

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const addr=await prisma.address.create({
    data: {
      userId: user.id,
      fullName: data.fullName,
      phone: data.phone,
      city: data.city,
      fullAddress: data.fullAddress,
      isDefault: !!data.isDefault,
    },
  });
  return addr
}

export async function updateAddress(id: string, input: unknown) {
  const { user } = await requireUser();
  const data = addressSchema.parse(input);

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const addr=await prisma.address.update({
    where: { id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      city: data.city,
      fullAddress: data.fullAddress,
      isDefault: !!data.isDefault,
    },
  });
  return addr
}

export async function deleteAddress(id: string) {
  const { user } = await requireUser();
  await prisma.address.delete({ where: { id } });
}
