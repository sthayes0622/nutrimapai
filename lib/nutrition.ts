import type { ActivityLevel, Goal, Sex, NutritionProfile, DietStyle } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function calculateBMR(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  if (sex === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateMacros(
  calories: number,
  dietStyle: DietStyle
): { proteinG: number; carbsG: number; fatG: number } {
  const ratios: Record<DietStyle, { protein: number; carbs: number; fat: number }> = {
    balanced:      { protein: 0.25, carbs: 0.45, fat: 0.30 },
    high_protein:  { protein: 0.40, carbs: 0.30, fat: 0.30 },
    vegan:         { protein: 0.20, carbs: 0.55, fat: 0.25 },
    vegetarian:    { protein: 0.20, carbs: 0.50, fat: 0.30 },
    mediterranean: { protein: 0.25, carbs: 0.45, fat: 0.30 },
    keto:          { protein: 0.25, carbs: 0.05, fat: 0.70 },
    custom:        { protein: 0.25, carbs: 0.45, fat: 0.30 },
  };

  const r = ratios[dietStyle];
  return {
    proteinG: Math.round((calories * r.protein) / 4),
    carbsG: Math.round((calories * r.carbs) / 4),
    fatG: Math.round((calories * r.fat) / 9),
  };
}

export function calculateNutritionProfile(
  age: number,
  sex: Sex,
  heightCm: number,
  weightKg: number,
  activityLevel: ActivityLevel,
  goal: Goal,
  dietStyle: DietStyle
): Omit<NutritionProfile, "age" | "sex" | "heightCm" | "weightKg" | "activityLevel" | "goal" | "dietStyle"> {
  const bmr = calculateBMR(sex, weightKg, heightCm, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalories = Math.max(1200, tdee + GOAL_ADJUSTMENTS[goal]);
  const macros = calculateMacros(dailyCalories, dietStyle);

  return {
    dailyCalories,
    ...macros,
  };
}
