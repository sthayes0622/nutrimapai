import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event;

    if (!event) return NextResponse.json({ ok: true });

    const appUserId = event.app_user_id;
    const expiresAt = event.expiration_at_ms
      ? new Date(event.expiration_at_ms)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Find user by ID (RevenueCat app_user_id is set to our user ID)
    const user = await prisma.user.findUnique({ where: { id: appUserId } });
    if (!user) return NextResponse.json({ ok: true });

    const eventType = event.type;

    if (["INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE", "REACTIVATION"].includes(eventType)) {
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: "active",
          plan: "premium",
          currentPeriodEnd: expiresAt,
          stripeSubscriptionId: `rc_${appUserId}`,
        },
        create: {
          userId: user.id,
          status: "active",
          plan: "premium",
          currentPeriodEnd: expiresAt,
          stripeCustomerId: `rc_${appUserId}`,
          stripeSubscriptionId: `rc_sub_${appUserId}`,
        },
      });
    } else if (["CANCELLATION", "EXPIRATION", "BILLING_ISSUE"].includes(eventType)) {
      await prisma.subscription.updateMany({
        where: { userId: user.id },
        data: { status: "canceled" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RevenueCat webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
