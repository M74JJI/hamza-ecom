'use server';

import { requireAdmin } from "@/lib/require-admin";
import { prisma } from '@/lib/db';

function parseOptionalDate(value: FormDataEntryValue | null) {
  const text = String(value || '').trim();
  if (!text) return null;

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseCoupon(formData: FormData) {
  const code = String(formData.get('code') || '').trim().toUpperCase();
  const percent = Number(formData.get('percent'));
  const startsAt = parseOptionalDate(formData.get('startsAt'));
  const endsAt = parseOptionalDate(formData.get('endsAt'));
  const active = String(formData.get('active') || 'true') === 'true';

  if (
    !code ||
    !Number.isInteger(percent) ||
    percent < 1 ||
    percent > 100 ||
    startsAt === undefined ||
    endsAt === undefined ||
    (startsAt && endsAt && startsAt > endsAt)
  ) {
    return null;
  }

  return { code, percent, startsAt, endsAt, active };
}

export async function createCoupon(formData: FormData) {
  await requireAdmin();

  const data = parseCoupon(formData);
  if (!data) return { error: 'Invalid coupon data' };

  try {
    await prisma.coupon.create({ data });
    return { ok: true };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { error: 'Coupon code already exists' };
    }
    return { error: 'Failed to create coupon' };
  }
}

export async function updateCoupon(id: string, formData: FormData) {
  await requireAdmin();

  const data = parseCoupon(formData);
  if (!data) return { error: 'Invalid coupon data' };

  try {
    const updated = await prisma.coupon.updateMany({
      where: { id },
      data,
    });

    if (updated.count !== 1) {
      return { error: 'Coupon not found' };
    }

    return { ok: true };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { error: 'Coupon code already exists' };
    }
    return { error: 'Failed to update coupon' };
  }
}

export async function deleteCouponAction(id: string) {
  await requireAdmin();
  try {
    await prisma.coupon.delete({
      where: { id }
    });
    return { ok: true };
  } catch {
    return { error: 'Failed to delete coupon' };
  }
}
