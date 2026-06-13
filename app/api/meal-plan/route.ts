import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 300;
import { generateMealPlan } from "@/lib/claude";
import type { NutritionProfile } from "@/lib/types";

const schema = z.object({
  profile: z.object({
    age: z.number(),
    sex: z.string(),
    heightCm: z.number(),
    weightKg: z.number(),
    activityLevel: z.string(),
    goal: z.string(),
    dietStyle: z.string(),
    dailyCalories: z.number(),
    proteinG: z.number(),
    carbsG: z.number(),
    fatG: z.number(),
  }),
  dietStyle: z.enum([
    "balanced",
    "high_protein",
    "vegan",
    "vegetarian",
    "mediterranean",
    "keto",
    "custom",
  ]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, dietStyle } = schema.parse(body);

    const mealPlan = await generateMealPlan(profile as NutritionProfile, dietStyle);

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error("Meal plan generation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to generate meal plan. Please try again." },
      { status: 500 }
    );
  }
}
