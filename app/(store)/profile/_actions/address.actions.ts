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

  return prisma.address.create({
    data: {
      userId: user.id,
      fullName: data.fullName,
      phone: data.phone,
      city: data.city,
      fullAddress: data.fullAddress,
      isDefault: !!data.isDefault,
    },
  });
}

export async function updateAddress(id: string, input: unknown) {
  const { user } = await requireUser();
  const data = addressSchema.parse(input);

  const owned = await prisma.address.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!owned) {
    throw new Error('Address not found');
  }

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id: owned.id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      city: data.city,
      fullAddress: data.fullAddress,
      isDefault: !!data.isDefault,
    },
  });
}

export async function deleteAddress(id: string) {
  const { user } = await requireUser();

  const deleted = await prisma.address.deleteMany({
    where: { id, userId: user.id },
  });

  if (deleted.count !== 1) {
    throw new Error('Address not found');
  }
}
