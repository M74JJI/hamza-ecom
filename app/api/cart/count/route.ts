import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ count: 0 });
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { select: { quantity: true } } },
    });
    const count = cart?.items.reduce((acc, it) => acc + it.quantity, 0) ?? 0;
    return NextResponse.json({ count });
  } catch (e) {
    console.error("cart/count error", e);
    return NextResponse.json({ count: 0 });
  }
}
