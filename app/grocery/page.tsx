"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SpinnerIcon, CheckIcon } from "@/components/ui/icons";
import type { MealPlan, GroceryList, GroceryItem } from "@/lib/types";

export default function GroceryPage() {
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedPlan = localStorage.getItem("nutrimap_meal_plan");
    if (!storedPlan) {
      router.push("/dashboard");
      return;
    }
    setMealPlan(JSON.parse(storedPlan));

    const storedList = localStorage.getItem("nutrimap_grocery_list");
    if (storedList) {
      setGroceryList(JSON.parse(storedList));
    }
  }, [router]);

  async function generateList() {
    if (!mealPlan) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealPlan),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const list: GroceryList = await res.json();
      setGroceryList(list);
      localStorage.setItem("nutrimap_grocery_list", JSON.stringify(list));
    } catch {
      setError("Failed to generate grocery list. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function toggleItem(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function itemKey(category: string, item: GroceryItem) {
    return `${category}-${item.name}`;
  }

  const totalItems = groceryList?.categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  ) ?? 0;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  if (!mealPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerIcon className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🥗</span>
            <span className="font-bold text-lg text-gray-900">NutriMap AI</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            ← Meal Plan
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Grocery List</h1>
          <p className="text-gray-500 text-sm mt-1">
            Based on your 7-day meal plan: {mealPlan.name}
          </p>
        </div>

        {!groceryList ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Generate Your Grocery List
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We&apos;ll analyze your 7-day meal plan and create a consolidated, categorized
              shopping list — eliminating duplicates.
            </p>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <button
              onClick={generateList}
              disabled={generating}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {generating ? (
                <>
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  Generating... (30-60 seconds)
                </>
              ) : (
                "Generate Grocery List →"
              )}
            </button>
          </div>
        ) : (
          <div>
            {/* Progress bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">Shopping Progress</span>
                  <span className="text-green-600 font-semibold">
                    {checkedCount}/{totalItems} items
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: totalItems > 0 ? `${(checkedCount / totalItems) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <button
                onClick={generateList}
                disabled={generating}
                className="text-sm text-green-600 hover:text-green-700 font-medium whitespace-nowrap"
              >
                {generating ? "Regenerating..." : "Regenerate"}
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              {groceryList.categories.map((cat) => (
                <div
                  key={cat.category}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {cat.category}
                      <span className="text-gray-400 font-normal ml-2">
                        ({cat.items.length} items)
                      </span>
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {cat.items.map((item) => {
                      const key = itemKey(cat.category, item);
                      const isChecked = checked[key];
                      return (
                        <li
                          key={key}
                          onClick={() => toggleItem(key)}
                          className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isChecked ? "opacity-50" : ""
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isChecked
                                ? "bg-green-600 border-green-600"
                                : "border-gray-300"
                            }`}
                          >
                            {isChecked && <CheckIcon className="w-3 h-3 text-white" />}
                          </div>
                          <span
                            className={`flex-1 text-sm ${
                              isChecked ? "line-through text-gray-400" : "text-gray-800"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {item.quantity} {item.unit}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {checkedCount === totalItems && totalItems > 0 && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-semibold text-green-800">
                  You&apos;ve got everything! Time to cook.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block mt-3 text-sm text-green-700 font-medium hover:text-green-900"
                >
                  Back to Meal Plan →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
