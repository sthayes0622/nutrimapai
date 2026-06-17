"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SpinnerIcon, CheckIcon } from "@/components/ui/icons";
import { AppLayout } from "@/components/AppLayout";

interface AccountData {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  usageThisMonth: number;
}

function AccountContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const upgrade = searchParams.get("upgrade");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  async function handleUpgrade(priceId: string) {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  useEffect(() => {
    if (!session) return;
    fetch("/api/account")
      .then((r) => r.json())
      .then((data) => {
        setAccount(data);
        if (upgrade === "true" && data.plan !== "premium") {
          handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, upgrade]);

  async function handlePortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setPortalLoading(false);
  }

  if (status === "loading" || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerIcon className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const isPremium = account.plan === "premium" && account.status === "active";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckIcon className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">You&apos;re now on Premium! Enjoy unlimited meal plans.</p>
          </div>
        )}
        {canceled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800">Upgrade canceled. You&apos;re still on the free plan.</p>
          </div>
        )}
        {upgrade && !isPremium && loading && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <SpinnerIcon className="w-4 h-4 text-green-600 animate-spin" />
            <p className="text-green-800 font-medium">Redirecting you to checkout...</p>
          </div>
        )}

        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-900">{session?.user?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{session?.user?.email}</span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Subscription</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isPremium ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {isPremium ? "PREMIUM" : "FREE"}
            </span>
          </div>

          {isPremium ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Unlimited meal plans and grocery lists.
                {account.currentPeriodEnd && <> Renews {new Date(account.currentPeriodEnd).toLocaleDateString()}.</>}
              </p>
              <button onClick={handlePortal} disabled={portalLoading}
                className="text-sm text-gray-600 underline hover:text-gray-900 disabled:opacity-50">
                {portalLoading ? "Loading..." : "Manage billing →"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-1">Free plan: <strong>{account.usageThisMonth}/1</strong> meal plans used this month.</p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(account.usageThisMonth * 100, 100)}%` }} />
                </div>
              </div>
              <div className="border border-green-200 rounded-xl p-5 bg-green-50">
                <p className="font-semibold text-gray-900 mb-3">Upgrade to Premium</p>
                <ul className="text-sm text-gray-600 space-y-1.5 mb-4">
                  {["Unlimited meal plans", "Unlimited grocery lists", "Priority AI generation"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3">
                  <button onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!)} disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <SpinnerIcon className="w-3 h-3 animate-spin" />}
                    $7.99/month
                  </button>
                  <button onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID!)} disabled={loading}
                    className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50">
                    $59/year
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function AccountPage() {
  return <Suspense><AccountContent /></Suspense>;
}
