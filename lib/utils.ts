import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCalories(cal: number): string {
  return cal.toLocaleString();
}

export function formatMacro(g: number, label: string): string {
  return `${g}g ${label}`;
}

export const DIET_STYLE_LABELS: Record<string, string> = {
  balanced: "Balanced",
  high_protein: "High Protein",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  mediterranean: "Mediterranean",
  keto: "Keto",
  custom: "Custom",
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary (little/no exercise)",
  lightly_active: "Lightly Active (1-3 days/week)",
  moderately_active: "Moderately Active (3-5 days/week)",
  very_active: "Very Active (6-7 days/week)",
  extra_active: "Extra Active (physical job or 2x/day)",
};

export const GOAL_LABELS: Record<string, string> = {
  lose: "Lose Weight",
  maintain: "Maintain Weight",
  gain: "Gain Muscle",
};
