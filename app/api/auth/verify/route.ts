import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/app-url";
import { getPersistedOneTimeTokenCandidates } from "@/lib/one-time-token";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const verification = await prisma.verificationToken.findFirst({
    where: {
      token: { in: getPersistedOneTimeTokenCandidates(token) },
      expires: { gt: new Date() },
    },
  });

  if (!verification) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const consumed = await tx.verificationToken.deleteMany({
        where: {
          id: verification.id,
          expires: { gt: new Date() },
        },
      });

      if (consumed.count !== 1) {
        throw new Error("VERIFICATION_TOKEN_CONSUMED");
      }

      const verified = await tx.user.updateMany({
        where: { email: verification.identifier },
        data: { emailVerified: new Date() },
      });

      if (verified.count !== 1) {
        throw new Error("VERIFICATION_TOKEN_CONSUMED");
      }

      await tx.verificationToken.deleteMany({
        where: { identifier: verification.identifier },
      });
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "VERIFICATION_TOKEN_CONSUMED"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }
    throw error;
  }

  return NextResponse.redirect(new URL("/?verified=1", getAppUrl()), 303);
}
