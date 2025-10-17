'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export async function signOutAction() {
  const c = await cookies();                    // Next 15: cookies() is async
  const token = c.get('session')?.value;        // cookie name must match your login

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    c.delete('session');                        // deletes cookie on the outgoing response
  }

  redirect('/');                                // re-render + bounce to home
}
