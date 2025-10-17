'use server';

import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { cookies } from 'next/headers';

export async function revokeSession(id: string){
  const { user } = await requireUser();
  // Ensure the session belongs to the current user
  const s = await prisma.session.findUnique({ where: { id } });
  if(!s || s.userId !== user.id) return;
  await prisma.session.delete({ where: { id } });
}

export async function revokeAllExceptCurrent(){
  const { user } = await requireUser();
  const c = await cookies();
  const currentToken = c.get('session')?.value;
  // Delete all user sessions except the one matching current cookie token
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
      ...(currentToken ? { NOT: { token: currentToken } } : {}),
    }
  });
}
