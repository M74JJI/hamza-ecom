'use server';

import { prisma } from '@/lib/db';

export async function createCoupon(formData: FormData) {
  const code = String(formData.get('code')||'').trim().toUpperCase();
  const percent = Math.max(0, Math.min(100, Number(formData.get('percent')||0)));
  const startsAtStr = String(formData.get('startsAt')||'');
  const endsAtStr = String(formData.get('endsAt')||'');
  const active = String(formData.get('active')||'true') === 'true';
  if(!code || percent<=0) return;
  await prisma.coupon.create({
    data: {
      code, percent, active,
      startsAt: startsAtStr? new Date(startsAtStr): null,
      endsAt: endsAtStr? new Date(endsAtStr): null,
    }
  });
}

export async function updateCoupon(id: string, formData: FormData) {
  const code = String(formData.get('code')||'').trim().toUpperCase();
  const percent = Math.max(0, Math.min(100, Number(formData.get('percent')||0)));
  const startsAtStr = String(formData.get('startsAt')||'');
  const endsAtStr = String(formData.get('endsAt')||'');
  const active = String(formData.get('active')||'true') === 'true';
  if(!code || percent<=0) return;
  await prisma.coupon.update({
    where: { id },
    data: {
      code, percent, active,
      startsAt: startsAtStr? new Date(startsAtStr): null,
      endsAt: endsAtStr? new Date(endsAtStr): null,
    }
  });
}

export async function deleteCouponAction(id: string) {
  try {
    await prisma.coupon.delete({
      where: { id }
    });
  } catch (error) {
    return { error: 'Failed to delete coupon' };
  }
}