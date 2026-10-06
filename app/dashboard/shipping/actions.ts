'use server';

import { requireAdmin } from "@/lib/require-admin";
import { prisma } from '@/lib/db';

function parseDeliveryCompany(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const priceMAD = Number(formData.get('priceMAD'));
  const avgDays = Number(formData.get('avgDays'));
  const active = String(formData.get('active') || 'true') === 'true';

  if (
    !name ||
    !Number.isFinite(priceMAD) ||
    priceMAD < 0 ||
    !Number.isInteger(avgDays) ||
    avgDays < 0
  ) {
    return null;
  }

  return { name, priceMAD, avgDays, active };
}

export async function createDeliveryCompany(formData: FormData) {
  await requireAdmin();

  const data = parseDeliveryCompany(formData);
  if (!data) return { error: 'Invalid delivery company data' };

  await prisma.deliveryCompany.create({ data });
  return { ok: true };
}

export async function updateDeliveryCompany(id: string, formData: FormData) {
  await requireAdmin();

  const data = parseDeliveryCompany(formData);
  if (!data) return { error: 'Invalid delivery company data' };

  const updated = await prisma.deliveryCompany.updateMany({
    where: { id },
    data,
  });

  if (updated.count !== 1) {
    return { error: 'Delivery company not found' };
  }

  return { ok: true };
}

export async function deleteDeliveryCompanyAction(id: string) {
  await requireAdmin();
  try {
    await prisma.deliveryCompany.delete({
      where: { id }
    });
    return { ok: true };
  } catch {
    return { error: 'Failed to delete delivery company' };
  }
}
