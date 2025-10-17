import { prisma } from '@/lib/db';
import { CouponsClient } from './CouponsClient';

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function CouponsAdmin() {
  const coupons = await prisma.coupon.findMany({ 
    orderBy: { createdAt: 'desc' } 
  });

  return <CouponsClient coupons={coupons} />;
}