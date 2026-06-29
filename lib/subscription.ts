import { prisma } from "./prisma";

const FREE_PLAN_LIMIT = 1; // meal plans per month

// Checks the database subscription record (updated by the RevenueCat webhook).
function isPremiumFromDb(sub: { status: string; currentPeriodEnd: Date | null } | null): boolean {
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;
  return true;
}

// Source of truth for premium status. Queries RevenueCat directly (the
// authoritative store of the user's entitlement) so the backend never
// disagrees with the app UI. Falls back to the database record if the
// RevenueCat API is unavailable.
export async function isPremium(userId: string): Promise<boolean> {
  const secret = process.env.REVENUECAT_SECRET_KEY;
  if (secret) {
    try {
      const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: { Authorization: `Bearer ${secret}` },
        // Don't let a slow RevenueCat call hang the request.
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        const ent = data?.subscriber?.entitlements?.premium;
        if (ent) {
          // expires_date is null for lifetime, or an ISO date for subscriptions.
          if (!ent.expires_date) return true;
          return new Date(ent.expires_date) > new Date();
        }
        return false;
      }
    } catch {
      // fall through to the database check
    }
  }

  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return isPremiumFromDb(sub);
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
