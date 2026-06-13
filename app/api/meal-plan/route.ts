import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateMealPlan } from "@/lib/claude";
import { isPremium, checkFreeUsage, incrementUsage } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import type { NutritionProfile } from "@/lib/types";

export const maxDuration = 300;

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
    "balanced", "high_protein", "vegan", "vegetarian", "mediterranean", "keto", "custom",
  ]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    // Check usage limits for logged-in users
    if (userId) {
      const premium = await isPremium(userId);
      if (!premium) {
        const usage = await checkFreeUsage(userId);
        if (!usage.allowed) {
          return NextResponse.json(
            { error: "free_limit_reached", used: usage.used, limit: usage.limit },
            { status: 403 }
          );
        }
      }
    }

    const body = await req.json();
    const { profile, dietStyle } = schema.parse(body);

    const mealPlan = await generateMealPlan(profile as NutritionProfile, dietStyle);

    // Save to DB and increment usage if logged in
    if (userId) {
      await prisma.mealPlan.create({
        data: {
          userId,
          name: mealPlan.name,
          days: mealPlan.days as object[],
          dietStyle: mealPlan.dietStyle,
        },
      });

      const premium = await isPremium(userId);
      if (!premium) await incrementUsage(userId);
    }

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error("Meal plan generation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to generate meal plan." }, { status: 500 });
  }
}
