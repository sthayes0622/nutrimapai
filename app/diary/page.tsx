"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";

const WATER_GOAL = 8;
const dateKey = () => new Date().toISOString().split("T")[0];
const waterKey = () => `water_${dateKey()}`;
const diaryKey = () => `diary_${dateKey()}`;

const QUICK_ADDS = [
  // Protein
  { name: "Chicken Breast (4oz)", calories: 185, proteinG: 35, carbsG: 0, fatG: 4 },
  { name: "Chicken Thigh (4oz)", calories: 210, proteinG: 28, carbsG: 0, fatG: 11 },
  { name: "Ground Beef 90% (4oz)", calories: 196, proteinG: 24, carbsG: 0, fatG: 11 },
  { name: "Salmon (4oz)", calories: 233, proteinG: 25, carbsG: 0, fatG: 14 },
  { name: "Tuna (can, 3oz)", calories: 100, proteinG: 22, carbsG: 0, fatG: 1 },
  { name: "Shrimp (4oz)", calories: 112, proteinG: 24, carbsG: 0, fatG: 1 },
  { name: "Egg", calories: 78, proteinG: 6, carbsG: 1, fatG: 5 },
  { name: "Egg Whites (3)", calories: 52, proteinG: 11, carbsG: 1, fatG: 0 },
  { name: "Greek Yogurt", calories: 100, proteinG: 17, carbsG: 6, fatG: 0 },
  { name: "Cottage Cheese (½ cup)", calories: 110, proteinG: 14, carbsG: 5, fatG: 2 },
  { name: "Protein Shake", calories: 150, proteinG: 25, carbsG: 8, fatG: 3 },
  { name: "Turkey Breast (4oz)", calories: 153, proteinG: 34, carbsG: 0, fatG: 1 },
  // Carbs
  { name: "Brown Rice (1 cup)", calories: 216, proteinG: 5, carbsG: 45, fatG: 2 },
  { name: "White Rice (1 cup)", calories: 206, proteinG: 4, carbsG: 45, fatG: 0 },
  { name: "Oatmeal (½ cup dry)", calories: 150, proteinG: 5, carbsG: 27, fatG: 3 },
  { name: "Sweet Potato (medium)", calories: 103, proteinG: 2, carbsG: 24, fatG: 0 },
  { name: "White Potato (medium)", calories: 163, proteinG: 4, carbsG: 37, fatG: 0 },
  { name: "Whole Wheat Bread (slice)", calories: 81, proteinG: 4, carbsG: 14, fatG: 1 },
  { name: "Pasta (2oz dry)", calories: 200, proteinG: 7, carbsG: 41, fatG: 1 },
  { name: "Quinoa (1 cup cooked)", calories: 222, proteinG: 8, carbsG: 39, fatG: 4 },
  { name: "Banana", calories: 105, proteinG: 1, carbsG: 27, fatG: 0 },
  { name: "Apple (medium)", calories: 95, proteinG: 0, carbsG: 25, fatG: 0 },
  { name: "Blueberries (1 cup)", calories: 84, proteinG: 1, carbsG: 21, fatG: 0 },
  { name: "Orange (medium)", calories: 62, proteinG: 1, carbsG: 15, fatG: 0 },
  // Fats
  { name: "Avocado (half)", calories: 120, proteinG: 2, carbsG: 6, fatG: 11 },
  { name: "Almonds (1oz)", calories: 164, proteinG: 6, carbsG: 6, fatG: 14 },
  { name: "Peanut Butter (2 tbsp)", calories: 188, proteinG: 8, carbsG: 6, fatG: 16 },
  { name: "Almond Butter (2 tbsp)", calories: 196, proteinG: 7, carbsG: 6, fatG: 18 },
  { name: "Olive Oil (1 tbsp)", calories: 119, proteinG: 0, carbsG: 0, fatG: 14 },
  { name: "Walnuts (1oz)", calories: 185, proteinG: 4, carbsG: 4, fatG: 18 },
  { name: "Cashews (1oz)", calories: 157, proteinG: 5, carbsG: 9, fatG: 12 },
  { name: "Cheese (1oz)", calories: 113, proteinG: 7, carbsG: 0, fatG: 9 },
  // Dairy & Other
  { name: "Milk (1 cup)", calories: 149, proteinG: 8, carbsG: 12, fatG: 8 },
  { name: "Skim Milk (1 cup)", calories: 83, proteinG: 8, carbsG: 12, fatG: 0 },
  { name: "Whey Protein (scoop)", calories: 120, proteinG: 24, carbsG: 3, fatG: 2 },
  // Veggies
  { name: "Broccoli (1 cup)", calories: 55, proteinG: 4, carbsG: 11, fatG: 1 },
  { name: "Spinach (2 cups)", calories: 14, proteinG: 2, carbsG: 2, fatG: 0 },
  { name: "Mixed Salad (2 cups)", calories: 20, proteinG: 2, carbsG: 3, fatG: 0 },
];

interface LogEntry { id: string; name: string; calories: number; proteinG: number; carbsG: number; fatG: number; time: string; }

export default function DiaryPage() {
  const [water, setWater] = useState(0);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [custom, setCustom] = useState({ name: "", calories: "", proteinG: "", carbsG: "", fatG: "" });
  const [search, setSearch] = useState("");

  const suggestions = search.trim().length > 0
    ? QUICK_ADDS.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : QUICK_ADDS;
  const [profile, setProfile] = useState<{ dailyCalories?: number; proteinG?: number; carbsG?: number; fatG?: number } | null>(null);

  useEffect(() => {
    setWater(parseInt(localStorage.getItem(waterKey()) || "0"));
    const stored = localStorage.getItem(diaryKey());
    if (stored) setEntries(JSON.parse(stored));
    const p = localStorage.getItem("nutrimap_profile");
    if (p) setProfile(JSON.parse(p));
  }, []);

  function saveEntries(updated: LogEntry[]) {
    setEntries(updated);
    localStorage.setItem(diaryKey(), JSON.stringify(updated));
  }

  function setWaterAndSave(n: number) {
    const clamped = Math.max(0, Math.min(12, n));
    setWater(clamped);
    localStorage.setItem(waterKey(), clamped.toString());
  }

  function addEntry(item: Omit<LogEntry, "id" | "time">) {
    const entry: LogEntry = {
      ...item,
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    saveEntries([...entries, entry]);
    setShowAdd(false);
    setCustom({ name: "", calories: "", proteinG: "", carbsG: "", fatG: "" });
  }

  function removeEntry(id: string) {
    saveEntries(entries.filter((e) => e.id !== id));
  }

  function addCustom() {
    if (!custom.name || !custom.calories) return;
    addEntry({ name: custom.name, calories: parseInt(custom.calories) || 0, proteinG: parseInt(custom.proteinG) || 0, carbsG: parseInt(custom.carbsG) || 0, fatG: parseInt(custom.fatG) || 0 });
  }

  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + e.calories, proteinG: acc.proteinG + e.proteinG,
    carbsG: acc.carbsG + e.carbsG, fatG: acc.fatG + e.fatG,
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });

  const calorieGoal = profile?.dailyCalories || 2000;
  const calorieProgress = Math.min(totals.calories / calorieGoal, 1);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📓 Diary</h1>
            <p className="text-gray-500 text-sm mt-1">{today}</p>
          </div>
        </div>

        {/* Calorie summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Calories</h2>
            <span className={`text-sm font-semibold ${totals.calories > calorieGoal ? "text-red-500" : "text-green-600"}`}>
              {totals.calories} / {calorieGoal} kcal
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${calorieProgress * 100}%`, backgroundColor: calorieProgress > 1 ? "#ef4444" : "#16a34a" }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Protein", eaten: totals.proteinG, goal: profile?.proteinG, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Carbs", eaten: totals.carbsG, goal: profile?.carbsG, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Fat", eaten: totals.fatG, goal: profile?.fatG, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((m) => (
              <div key={m.label} className={`${m.bg} rounded-xl p-3 text-center`}>
                <div className={`text-lg font-bold ${m.color}`}>{m.eaten}g</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.label}{m.goal ? ` / ${m.goal}g` : ""}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Water Tracker */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">💧 Water Intake</h2>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${water >= WATER_GOAL ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"}`}>
              {water}/{WATER_GOAL} glasses
            </span>
          </div>
          <div className="grid grid-cols-8 gap-2 mb-4">
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <button key={i} onClick={() => setWaterAndSave(i + 1)}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${i < water ? "bg-blue-400 shadow-sm scale-105" : "bg-gray-100 hover:bg-blue-100"}`}>
                {i < water ? "💧" : <span className="text-gray-400 text-sm">○</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setWaterAndSave(water - 1)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">− Remove</button>
            <button onClick={() => setWaterAndSave(water + 1)} className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">+ Add Glass</button>
          </div>
          {water >= WATER_GOAL && (
            <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3 text-center text-sm text-green-700 font-medium">
              🎉 Goal reached! Great job staying hydrated today.
            </div>
          )}
        </div>

        {/* Food log */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Today&apos;s Food</h2>
            <button onClick={() => setShowAdd(!showAdd)}
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
              + Log Food
            </button>
          </div>

          {/* Add food panel */}
          {showAdd && (
            <div className="border-b border-gray-100 p-6 bg-gray-50 space-y-4">
              <h3 className="font-semibold text-gray-900">Custom Entry</h3>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    value={custom.name}
                    onChange={(e) => { setCustom((c) => ({ ...c, name: e.target.value })); setSearch(e.target.value); }}
                    placeholder="Search or type a food name..."
                    autoFocus
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {suggestions.map((item) => (
                        <button key={item.name} onMouseDown={() => {
                          addEntry(item);
                          setSearch("");
                          setCustom({ name: "", calories: "", proteinG: "", carbsG: "", fatG: "" });
                        }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-50 last:border-0">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.proteinG}g P · {item.carbsG}g C · {item.fatG}g F</div>
                          </div>
                          <span className="text-sm font-bold text-green-600 ml-4">{item.calories} cal</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: "calories", label: "Calories" },
                    { key: "proteinG", label: "Protein (g)" },
                    { key: "carbsG", label: "Carbs (g)" },
                    { key: "fatG", label: "Fat (g)" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                      <input type="number" value={custom[key as keyof typeof custom]}
                        onChange={(e) => setCustom((c) => ({ ...c, [key]: e.target.value }))}
                        placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                  <button onClick={addCustom} disabled={!custom.name || !custom.calories}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40">
                    Add Entry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Log entries */}
          {entries.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-sm">No food logged yet today</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 group">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{entry.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{entry.proteinG}g P · {entry.carbsG}g C · {entry.fatG}g F · {entry.time}</div>
                  </div>
                  <div className="font-bold text-gray-900">{entry.calories} cal</div>
                  <button onClick={() => removeEntry(entry.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none">×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
