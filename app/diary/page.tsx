"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";

const WATER_GOAL = 8;
const todayKey = () => `water_${new Date().toISOString().split("T")[0]}`;

export default function DiaryPage() {
  const [water, setWater] = useState(0);

  useEffect(() => {
    setWater(parseInt(localStorage.getItem(todayKey()) || "0"));
  }, []);

  function setWaterAndSave(n: number) {
    const clamped = Math.max(0, Math.min(12, n));
    setWater(clamped);
    localStorage.setItem(todayKey(), clamped.toString());
  }

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📓 Diary</h1>
          <p className="text-gray-500 text-sm mt-1">{today}</p>
        </div>

        {/* Water Tracker */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">💧 Water Intake</h2>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${water >= WATER_GOAL ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"}`}>
              {water}/{WATER_GOAL} glasses
            </span>
          </div>

          {/* Glass grid */}
          <div className="grid grid-cols-8 gap-2 mb-4">
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <button key={i} onClick={() => setWaterAndSave(i + 1)}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${
                  i < water ? "bg-blue-400 shadow-sm scale-105" : "bg-gray-100 hover:bg-blue-100"
                }`}>
                {i < water ? "💧" : <span className="text-gray-400 text-sm">○</span>}
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-blue-400 rounded-full transition-all"
              style={{ width: `${Math.min((water / WATER_GOAL) * 100, 100)}%` }} />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setWaterAndSave(water - 1)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              − Remove
            </button>
            <button onClick={() => setWaterAndSave(water + 1)}
              className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
              + Add Glass
            </button>
          </div>

          {water >= WATER_GOAL && (
            <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3 text-center text-sm text-green-700 font-medium">
              🎉 Goal reached! Great job staying hydrated today.
            </div>
          )}
        </div>

        {/* Coming soon */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm font-medium">Food logging coming soon</p>
        </div>
      </div>
    </AppLayout>
  );
}
