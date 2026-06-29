import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { jwtVerify } from "jose";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
      const { payload } = await jwtVerify(auth.slice(7), secret);
      return payload.id as string;
    } catch {}
  }
  const session = await getServerSession(authOptions);
  if (session?.user) return (session.user as { id: string }).id;
  return null;
}

// Permanently deletes the user's account and all associated data.
export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.nutritionProfile.deleteMany({ where: { userId } });
    await prisma.mealPlan.deleteMany({ where: { userId } });
    await prisma.groceryList.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Account deletion error:", e);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

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
