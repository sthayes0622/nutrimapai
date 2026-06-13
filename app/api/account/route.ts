import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const [user, sub] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { usageThisMonth: true, usageResetAt: true },
    }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  return NextResponse.json({
    plan: sub?.plan ?? "free",
    status: sub?.status ?? "inactive",
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    usageThisMonth: user?.usageThisMonth ?? 0,
  });
}
