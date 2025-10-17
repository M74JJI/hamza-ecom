'use server';

import { prisma } from '@/lib/db';

export async function createDeliveryCompany(formData: FormData) {
  const name = String(formData.get('name')||'').trim();
  const priceMAD = Number(formData.get('priceMAD')||0);
  const avgDays = Number(formData.get('avgDays')||2);
  const active = String(formData.get('active')||'true') === 'true';
  if(!name) return;
  await prisma.deliveryCompany.create({ data: { name, priceMAD, avgDays, active } });
}

export async function updateDeliveryCompany(id: string, formData: FormData) {
  const name = String(formData.get('name')||'').trim();
  const priceMAD = Number(formData.get('priceMAD')||0);
  const avgDays = Number(formData.get('avgDays')||2);
  const active = String(formData.get('active')||'true') === 'true';
  if(!name) return;
  await prisma.deliveryCompany.update({
    where: { id },
    data: { name, priceMAD, avgDays, active }
  });
}

export async function deleteDeliveryCompanyAction(id: string) {
  try {
    await prisma.deliveryCompany.delete({
      where: { id }
    });
  } catch (error) {
    return { error: 'Failed to delete delivery company' };
  }
}