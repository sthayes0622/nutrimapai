import { prisma } from "./prisma";

const FREE_PLAN_LIMIT = 1; // meal plans per month

export async function isPremium(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;
  return true;
}

export async function checkFreeUsage(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { usageThisMonth: true, usageResetAt: true },
  });

  if (!user) return { allowed: false, used: 0, limit: FREE_PLAN_LIMIT };

  // Reset counter if it's a new month
  const now = new Date();
  const resetAt = new Date(user.usageResetAt);
  const isNewMonth =
    now.getMonth() !== resetAt.getMonth() ||
    now.getFullYear() !== resetAt.getFullYear();

  if (isNewMonth) {
    await prisma.user.update({
      where: { id: userId },
      data: { usageThisMonth: 0, usageResetAt: now },
    });
    return { allowed: true, used: 0, limit: FREE_PLAN_LIMIT };
  }

  return {
    allowed: user.usageThisMonth < FREE_PLAN_LIMIT,
    used: user.usageThisMonth,
    limit: FREE_PLAN_LIMIT,
  };
}

export async function incrementUsage(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { usageThisMonth: { increment: 1 } },
  });
}
