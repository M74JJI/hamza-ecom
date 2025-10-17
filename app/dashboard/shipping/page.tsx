import { prisma } from '@/lib/db';
import { ShippingClient } from './ShippingClient';

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ShippingAdmin() {
  const companies = await prisma.deliveryCompany.findMany({ 
    orderBy: { createdAt: 'desc' } 
  });

  // ✅ Convert Decimal → number before passing to client
  const safeCompanies = companies.map(c => ({
    ...c,
    priceMAD: Number(c.priceMAD),
  }));

  return <ShippingClient companies={safeCompanies} />;
}
