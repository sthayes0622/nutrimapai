"use client";

import { useState } from "react";
import type { Meal } from "@/lib/types";

interface Props {
  meal: Meal;
  label: string;
  onClose: () => void;
}

export function RecipeModal({ meal, label, onClose }: Props) {
  const [servings, setServings] = useState(1);
  const scale = (v: number) => Math.round(v * servings);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{label}</p>
            <h2 className="text-xl font-bold text-gray-900">{meal.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4 mt-1">×</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Description */}
          <p className="text-gray-600 text-sm">{meal.description}</p>

          {/* Servings scaler */}
          <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Servings</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setServings(s => Math.max(0.5, s - 0.5))}
                className="w-8 h-8 rounded-full bg-green-600 text-white font-bold text-lg flex items-center justify-center hover:bg-green-700 transition-colors">−</button>
              <span className="text-lg font-bold text-green-700 w-8 text-center">{servings}</span>
              <button onClick={() => setServings(s => Math.min(10, s + 0.5))}
                className="w-8 h-8 rounded-full bg-green-600 text-white font-bold text-lg flex items-center justify-center hover:bg-green-700 transition-colors">+</button>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Calories", value: scale(meal.calories), unit: "kcal", color: "bg-orange-50 text-orange-700" },
              { label: "Protein", value: scale(meal.proteinG), unit: "g", color: "bg-blue-50 text-blue-700" },
              { label: "Carbs", value: scale(meal.carbsG), unit: "g", color: "bg-yellow-50 text-yellow-700" },
              { label: "Fat", value: scale(meal.fatG), unit: "g", color: "bg-purple-50 text-purple-700" },
            ].map((m) => (
              <div key={m.label} className={`${m.color} rounded-xl p-3 text-center`}>
                <div className="font-bold text-lg">{m.value}<span className="text-xs ml-0.5">{m.unit}</span></div>
                <div className="text-xs mt-0.5 opacity-75">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Time */}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>⏱ Prep: <strong className="text-gray-700">{meal.prepTimeMin} min</strong></span>
            <span>🔥 Cook: <strong className="text-gray-700">{meal.cookTimeMin} min</strong></span>
            <span>🍽 Serves: <strong className="text-gray-700">{meal.servings}</strong></span>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Ingredients {servings !== 1 && <span className="text-sm text-green-600 font-normal">(×{servings})</span>}</h3>
            <ul className="space-y-2">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
            <ol className="space-y-3">
              {meal.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
