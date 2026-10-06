'use server';

import { redirect } from 'next/navigation';
import { destroySession } from '@/lib/auth-utils';

export async function signOutAction() {
  await destroySession();
  redirect('/');
}
