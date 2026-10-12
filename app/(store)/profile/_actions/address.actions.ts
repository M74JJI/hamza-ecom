'use server';

import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { z } from 'zod';
import { isValidMoroccanPhone } from '@/lib/ma-phone';
import { MA_CITIES } from '@/lib/ma-cities';
import { revalidatePath } from 'next/cache';

const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(32).refine(isValidMoroccanPhone, 'Invalid Moroccan mobile number'),
  city: z.enum(MA_CITIES as [string, ...string[]]),
  fullAddress: z.string().trim().min(1).max(500),
  isDefault: z.boolean().optional(),
});

function refreshAddressViews() {
  revalidatePath('/profile/addresses');
  revalidatePath('/checkout');
}

export async function createAddress(input: unknown) {
  const { user } = await requireUser();
  const data = addressSchema.parse(input);

  const address = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;

    const existingAddressCount = await tx.address.count({ where: { userId: user.id } });
    const shouldBeDefault = Boolean(data.isDefault) || existingAddressCount === 0;

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone,
        city: data.city,
        fullAddress: data.fullAddress,
        isDefault: shouldBeDefault,
      },
    });
  });
  refreshAddressViews();
  return address;
}

export async function updateAddress(id: string, input: unknown) {
  const { user } = await requireUser();
  const data = addressSchema.parse(input);

  const address = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;

    const owned = await tx.address.findFirst({
      where: { id, userId: user.id },
      select: { id: true, isDefault: true },
    });

    if (!owned) {
      throw new Error('Address not found');
    }

    if (data.isDefault) {
      await tx.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: { not: owned.id },
        },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: owned.id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        city: data.city,
        fullAddress: data.fullAddress,
        isDefault: owned.isDefault || !!data.isDefault,
      },
    });
  });
  refreshAddressViews();
  return address;
}

export async function deleteAddress(id: string) {
  const { user } = await requireUser();
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;
    const address = await tx.address.findFirst({ where: { id, userId: user.id } });
    if (!address) throw new Error('Address not found');
    await tx.address.delete({ where: { id: address.id } });
    if (address.isDefault) {
      const replacement = await tx.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      if (replacement) {
        await tx.address.update({ where: { id: replacement.id }, data: { isDefault: true } });
      }
    }
  });
  refreshAddressViews();
}

export async function setDefaultAddress(id: string) {
  const { user } = await requireUser();
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;
    const owned = await tx.address.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!owned) throw new Error('Address not found');
    await tx.address.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } });
    await tx.address.update({ where: { id: owned.id }, data: { isDefault: true } });
  });
  refreshAddressViews();
}
