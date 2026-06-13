"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerIcon } from "@/components/ui/icons";

type Step = "profile" | "diet" | "calculating";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "lightly_active", label: "Lightly Active", desc: "Exercise 1-3 days/week" },
  { value: "moderately_active", label: "Moderately Active", desc: "Exercise 3-5 days/week" },
  { value: "very_active", label: "Very Active", desc: "Exercise 6-7 days/week" },
  { value: "extra_active", label: "Extra Active", desc: "Physical job or 2x training/day" },
];

const GOAL_OPTIONS = [
  { value: "lose", label: "Lose Weight", emoji: "⬇️" },
  { value: "maintain", label: "Maintain Weight", emoji: "⚖️" },
  { value: "gain", label: "Gain Muscle", emoji: "💪" },
];

const DIET_OPTIONS = [
  { value: "balanced", label: "Balanced", emoji: "⚖️", desc: "A mix of all food groups" },
  { value: "high_protein", label: "High Protein", emoji: "💪", desc: "Lean meats, eggs, protein shakes" },
  { value: "vegan", label: "Vegan", emoji: "🌱", desc: "100% plant-based, no animal products" },
  { value: "vegetarian", label: "Vegetarian", emoji: "🥗", desc: "Plant-based with eggs & dairy" },
  { value: "mediterranean", label: "Mediterranean", emoji: "🫒", desc: "Fish, olive oil, legumes, veggies" },
  { value: "keto", label: "Keto", emoji: "🥑", desc: "Very low carbs, high fat" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    age: "",
    sex: "female" as "male" | "female",
    heightFt: "",
    heightIn: "",
    weightLb: "",
    activityLevel: "moderately_active",
    goal: "maintain",
    dietStyle: "balanced",
    useMetric: false,
    heightCm: "",
    weightKg: "",
  });

  function set(key: string, val: string | boolean) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    let heightCm: number;
    let weightKg: number;

    if (form.useMetric) {
      heightCm = parseFloat(form.heightCm);
      weightKg = parseFloat(form.weightKg);
    } else {
      const ft = parseFloat(form.heightFt) || 0;
      const inches = parseFloat(form.heightIn) || 0;
      heightCm = (ft * 12 + inches) * 2.54;
      weightKg = parseFloat(form.weightLb) / 2.20462;
    }

    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseInt(form.age),
          sex: form.sex,
          heightCm: Math.round(heightCm * 10) / 10,
          weightKg: Math.round(weightKg * 10) / 10,
          activityLevel: form.activityLevel,
          goal: form.goal,
          dietStyle: form.dietStyle,
        }),
      });

      if (!res.ok) throw new Error("Failed to calculate nutrition");

      const profile = await res.json();
      localStorage.setItem("nutrimap_profile", JSON.stringify(profile));
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (step === "calculating" || loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <SpinnerIcon className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Calculating your nutrition...</h2>
          <p className="text-gray-600 mt-2">This takes just a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl">🥗</span>
            <span className="font-bold text-xl text-gray-900">NutriMap AI</span>
          </a>

          {/* Progress */}
          <div className="flex items-center gap-2 justify-center mb-6">
            {(["profile", "diet"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === s
                      ? "bg-green-600 text-white"
                      : (step === "diet" && s === "profile")
                      ? "bg-green-200 text-green-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 1 && <div className="w-12 h-1 bg-gray-200 rounded" />}
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {step === "profile" ? "Tell us about yourself" : "Choose your diet style"}
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            {step === "profile"
              ? "We'll calculate your personalized nutrition targets"
              : "We'll build a meal plan around your preferences"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {step === "profile" ? (
            <div className="space-y-5">
              {/* Unit toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => set("useMetric", false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    !form.useMetric ? "bg-white shadow text-gray-900" : "text-gray-500"
                  }`}
                >
                  Imperial
                </button>
                <button
                  onClick={() => set("useMetric", true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    form.useMetric ? "bg-white shadow text-gray-900" : "text-gray-500"
                  }`}
                >
                  Metric
                </button>
              </div>

              {/* Age + Sex */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                  <div className="flex gap-2">
                    {(["female", "male"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => set("sex", s)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize border transition-colors ${
                          form.sex === s
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                {form.useMetric ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={form.heightCm}
                      onChange={(e) => set("heightCm", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="170"
                    />
                    <span className="flex items-center text-gray-500 text-sm font-medium px-1">cm</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 flex gap-1">
                      <input
                        type="number"
                        value={form.heightFt}
                        onChange={(e) => set("heightFt", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="5"
                      />
                      <span className="flex items-center text-gray-500 text-sm px-1">ft</span>
                    </div>
                    <div className="flex-1 flex gap-1">
                      <input
                        type="number"
                        value={form.heightIn}
                        onChange={(e) => set("heightIn", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="6"
                      />
                      <span className="flex items-center text-gray-500 text-sm px-1">in</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.useMetric ? form.weightKg : form.weightLb}
                    onChange={(e) =>
                      set(form.useMetric ? "weightKg" : "weightLb", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={form.useMetric ? "70" : "150"}
                  />
                  <span className="flex items-center text-gray-500 text-sm font-medium px-1">
                    {form.useMetric ? "kg" : "lbs"}
                  </span>
                </div>
              </div>

              {/* Activity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                <div className="space-y-2">
                  {ACTIVITY_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => set("activityLevel", o.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                        form.activityLevel === o.value
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          form.activityLevel === o.value
                            ? "border-green-600 bg-green-600"
                            : "border-gray-400"
                        }`}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{o.label}</div>
                        <div className="text-xs text-gray-500">{o.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_OPTIONS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => set("goal", g.value)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-lg border font-medium text-sm transition-colors ${
                        form.goal === g.value
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xl">{g.emoji}</span>
                      <span className="text-xs">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep("diet")}
                disabled={!form.age || (!form.useMetric ? !form.heightFt || !form.weightLb : !form.heightCm || !form.weightKg)}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: Choose Diet Style →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {DIET_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => set("dietStyle", d.value)}
                    className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-colors ${
                      form.dietStyle === d.value
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{d.emoji}</span>
                    <span className="font-semibold text-sm text-gray-900">{d.label}</span>
                    <span className="text-xs text-gray-500">{d.desc}</span>
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("profile")}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-2 flex-grow bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Calculate My Plan →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
