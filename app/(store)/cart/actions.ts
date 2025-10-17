'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
export const dynamic = "force-dynamic";

// Redirects to /checkout (which re-validates+syncs cookie cart to DB)
export async function beginCheckoutAction() {
  const user = await getCurrentUser();
  if (!user) redirect('/cart?auth=required');
  redirect('/checkout');
}
