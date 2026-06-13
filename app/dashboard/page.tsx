"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SpinnerIcon } from "@/components/ui/icons";
import { RecipeModal } from "@/components/RecipeModal";
import type { NutritionProfile, MealPlan, Meal } from "@/lib/types";
import { DIET_STYLE_LABELS, GOAL_LABELS, ACTIVITY_LABELS } from "@/lib/utils";

interface RecipeTarget { meal: Meal; label: string; }

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [recipe, setRecipe] = useState<RecipeTarget | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("nutrimap_profile");
    if (!stored) { router.push("/onboarding"); return; }
    setProfile(JSON.parse(stored));
    const storedPlan = localStorage.getItem("nutrimap_meal_plan");
    if (storedPlan) setMealPlan(JSON.parse(storedPlan));
  }, [router]);

  async function generatePlan() {
    if (!profile) return;
    setGenerating(true);
    setError("");
    setLimitReached(false);

    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, dietStyle: profile.dietStyle }),
      });

      if (res.status === 403) { setLimitReached(true); return; }
      if (!res.ok) throw new Error("Failed");

      const plan: MealPlan = await res.json();
      setMealPlan(plan);
      localStorage.setItem("nutrimap_meal_plan", JSON.stringify(plan));
    } catch {
      setError("Failed to generate meal plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center"><SpinnerIcon className="w-8 h-8 text-green-600 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {recipe && <RecipeModal meal={recipe.meal} label={recipe.label} onClose={() => setRecipe(null)} />}

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🥗</span>
            <span className="font-bold text-lg text-gray-900">NutriMap AI</span>
          </Link>
          <div className="flex items-center gap-4">
            {mealPlan && <Link href="/grocery" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Grocery List</Link>}
            {session ? (
              <Link href="/account" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Account</Link>
            ) : (
              <Link href="/auth/register" className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">Sign Up Free</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Sign up prompt for guests */}
        {!session && mealPlan && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-blue-900">Save your meal plan</p>
              <p className="text-sm text-blue-700">Create a free account to save your plan and generate more.</p>
            </div>
            <Link href="/auth/register" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
              Sign Up Free →
            </Link>
          </div>
        )}

        {/* Nutrition Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Nutrition Plan</h1>
              <p className="text-gray-500 text-sm mt-1">
                {GOAL_LABELS[profile.goal]} · {DIET_STYLE_LABELS[profile.dietStyle]} · {ACTIVITY_LABELS[profile.activityLevel]?.split("(")[0].trim()}
              </p>
            </div>
            <Link href="/onboarding" className="text-sm text-green-600 hover:text-green-700 font-medium">Edit</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Daily Calories", value: `${profile.dailyCalories.toLocaleString()}`, unit: "kcal", color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Protein", value: `${profile.proteinG}`, unit: "g", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Carbs", value: `${profile.carbsG}`, unit: "g", color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Fat", value: `${profile.fatG}`, unit: "g", color: "text-purple-600", bg: "bg-purple-50" },
            ].map((m) => (
              <div key={m.label} className={`${m.bg} rounded-xl p-4 text-center`}>
                <div className={`text-2xl font-bold ${m.color}`}>{m.value}<span className="text-sm ml-0.5">{m.unit}</span></div>
                <div className="text-xs text-gray-600 mt-1 font-medium">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Free limit upgrade prompt */}
        {limitReached && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-8 text-white">
            <h2 className="text-xl font-bold mb-1">You&apos;ve used your free meal plan for this month</h2>
            <p className="text-green-100 mb-4">Upgrade to Premium for unlimited meal plans, grocery lists, and more.</p>
            <div className="flex gap-3">
              <Link href="/account" className="bg-white text-green-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition-colors text-sm">
                Upgrade to Premium →
              </Link>
              <span className="text-green-200 text-sm self-center">$7.99/month or $59/year</span>
            </div>
          </div>
        )}

        {/* Meal Plan */}
        {!mealPlan ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🍽️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Generate Your 7-Day Meal Plan</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              AI will create a personalized plan with full recipes tailored to your {DIET_STYLE_LABELS[profile.dietStyle].toLowerCase()} diet.
            </p>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <button onClick={generatePlan} disabled={generating}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
              {generating ? <><SpinnerIcon className="w-4 h-4 animate-spin" /> Generating... (30–60 sec)</> : "Generate Meal Plan →"}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{mealPlan.name}</h2>
              <div className="flex gap-3">
                <button onClick={generatePlan} disabled={generating} className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50">
                  {generating ? "Regenerating..." : "Regenerate"}
                </button>
                <Link href="/grocery" className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">
                  Grocery List →
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {mealPlan.days.map((day) => (
                <div key={day.day} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">{day.day}</h3>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{day.totalCalories} kcal</span>
                      <span>·</span><span>{day.totalProteinG}g protein</span>
                      <span>·</span><span>{day.totalCarbsG}g carbs</span>
                      <span>·</span><span>{day.totalFatG}g fat</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {[
                      { label: "Breakfast", meal: day.breakfast, emoji: "🌅" },
                      { label: "Lunch", meal: day.lunch, emoji: "☀️" },
                      { label: "Dinner", meal: day.dinner, emoji: "🌙" },
                    ].map(({ label, meal, emoji }) => (
                      <button
                        key={label}
                        onClick={() => setRecipe({ meal, label: `${emoji} ${label} — ${day.day}` })}
                        className="p-5 text-left hover:bg-green-50 transition-colors group w-full"
                      >
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{emoji} {label}</div>
                        <div className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-green-700">{meal.name}</div>
                        <div className="text-xs text-gray-500 mb-3 line-clamp-2">{meal.description}</div>
                        <div className="flex flex-wrap gap-1">
                          {[`${meal.calories} cal`, `${meal.proteinG}g P`, `${meal.carbsG}g C`, `${meal.fatG}g F`].map((tag) => (
                            <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                        <p className="text-xs text-green-600 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View recipe →</p>
                      </button>
                    ))}
                  </div>
                  {day.snack && (
                    <button
                      onClick={() => setRecipe({ meal: day.snack!, label: `🍎 Snack — ${day.day}` })}
                      className="w-full px-5 pb-4 border-t border-gray-100 flex items-center gap-3 pt-3 hover:bg-green-50 transition-colors group"
                    >
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">🍎 Snack</span>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-green-700">{day.snack.name}</span>
                      <span className="text-xs text-gray-500">{day.snack.calories} cal</span>
                      <span className="text-xs text-green-600 font-medium ml-auto opacity-0 group-hover:opacity-100">View recipe →</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
