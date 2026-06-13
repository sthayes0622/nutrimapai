import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateNutritionProfile } from "@/lib/nutrition";

const schema = z.object({
  age: z.number().min(13).max(100),
  sex: z.enum(["male", "female"]),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active",
  ]),
  goal: z.enum(["lose", "maintain", "gain"]),
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
    const parsed = schema.parse(body);

    const result = calculateNutritionProfile(
      parsed.age,
      parsed.sex,
      parsed.heightCm,
      parsed.weightKg,
      parsed.activityLevel,
      parsed.goal,
      parsed.dietStyle
    );

    return NextResponse.json({ ...parsed, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
