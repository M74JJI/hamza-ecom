"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import {
  getCurrentSessionToken,
  revokeUserSessions,
} from "@/lib/auth-utils";

export async function revokeSession(id: string) {
  const { user } = await requireUser();

  const deleted = await prisma.session.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  return { ok: deleted.count === 1 };
}

export async function revokeAllExceptCurrent() {
  const { user } = await requireUser();
  const currentToken = await getCurrentSessionToken();

  await revokeUserSessions(user.id, currentToken);
  return { ok: true };
}
