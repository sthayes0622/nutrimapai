"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

const tabs = [
  { href: "/dashboard", label: "Meal Plan", emoji: "🍽️" },
  { href: "/diary", label: "Diary", emoji: "📓" },
  { href: "/grocery", label: "Grocery", emoji: "🛒" },
  { href: "/account", label: "Profile", emoji: "👤" },
];

export function AppLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Green app header */}
      <header className="bg-green-600 text-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/icon.png" alt="NutriMap AI" width={28} height={28} className="rounded-lg opacity-90" />
            <span className="font-bold text-lg text-white">NutriMap AI</span>
          </Link>
          {title && <span className="text-green-100 text-sm font-medium">{title}</span>}
          {!session && (
            <Link href="/auth/register" className="text-sm bg-white text-green-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Sign Up Free
            </Link>
          )}
          {session && (
            <span className="text-green-100 text-sm">{(session.user as { name?: string })?.name?.split(" ")[0]}</span>
          )}
        </div>

        {/* Tab bar */}
        <div className="border-t border-green-500">
          <div className="max-w-4xl mx-auto px-4 flex">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link key={tab.href} href={tab.href}
                  className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    active ? "border-white text-white" : "border-transparent text-green-200 hover:text-white"
                  }`}>
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
