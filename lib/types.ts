export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extra_active";

export type Goal = "lose" | "maintain" | "gain";
export type Sex = "male" | "female";
export type DietStyle =
  | "balanced"
  | "high_protein"
  | "vegan"
  | "vegetarian"
  | "mediterranean"
  | "keto"
  | "custom";

export interface NutritionProfile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietStyle: DietStyle;
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  prepTimeMin: number;
  cookTimeMin: number;
}

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack?: Meal;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
}

export interface MealPlan {
  id?: string;
  name: string;
  dietStyle: DietStyle;
  days: DayPlan[];
  weekOf?: string;
}

export interface GroceryCategory {
  category: string;
  items: GroceryItem[];
}

export interface GroceryItem {
  name: string;
  quantity: string;
  unit: string;
  checked?: boolean;
}

export interface GroceryList {
  id?: string;
  mealPlanId?: string;
  categories: GroceryCategory[];
}
