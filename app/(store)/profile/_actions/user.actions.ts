'use server';

import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { z } from 'zod';
import { getCurrentSessionToken, hashPassword, verifyPassword } from '@/lib/auth-utils';
import { sendVerifyEmail } from '@/lib/emails/verify';
import { getAppUrl } from '@/lib/app-url';

const profileSchema = z.object({
  name: z.string().min(0).max(120).optional(),
  image: z.string().url().or(z.literal('')).optional(),
});

export async function updateProfile(input: unknown){
  const { user } = await requireUser();
  const data = profileSchema.parse(input);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name ?? undefined,
      image: data.image === '' ? null : data.image,
    }
  });
}

const changePasswordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(8),
});

export async function changePassword(input: unknown){
  const { user } = await requireUser();
  const data = changePasswordSchema.parse(input);
  const u = await prisma.user.findUnique({ where: { id: user.id } });
  if(!u?.passwordHash) throw new Error('Password auth not enabled.');
  const ok = await verifyPassword(u.passwordHash, data.current);
  if(!ok) throw new Error('Current password is incorrect.');
  const nextHash = await hashPassword(data.next);
  const currentToken = await getCurrentSessionToken();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: nextHash },
    }),
    prisma.session.deleteMany({
      where: {
        userId: user.id,
        ...(currentToken ? { token: { not: currentToken } } : {}),
      },
    }),
  ]);
}

export async function resendVerificationEmail(){
  const { user } = await requireUser();
  if(user.emailVerified) return true;
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000*60*60*24);
  await prisma.verificationToken.create({
    data: { identifier: user.email!, token, expires }
  });
  const verifyUrl = `${getAppUrl()}/api/auth/verify?token=${token}`;
  await sendVerifyEmail(user.email!, verifyUrl);
  return true;
}
