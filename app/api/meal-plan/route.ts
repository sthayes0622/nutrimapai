import { NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPremium, checkFreeUsage, incrementUsage } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import type { NutritionProfile, DietStyle } from "@/lib/types";

export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    dislikedFoods: z.string().optional(),
    allergies: z.string().optional(),
    cuisinePreferences: z.string().optional(),
    regenNotes: z.string().optional(),
  }),
  dietStyle: z.enum([
    "balanced", "high_protein", "vegan", "vegetarian", "mediterranean", "keto", "custom",
  ]),
});

function buildPrompt(profile: NutritionProfile & { dislikedFoods?: string; allergies?: string; cuisinePreferences?: string }, dietStyle: DietStyle) {
  const dietDescriptions: Record<string, string> = {
    balanced: "balanced with a mix of all macronutrients",
    high_protein: "high-protein focused on lean meats, eggs, and protein-rich foods",
    vegan: "100% plant-based with no animal products",
    vegetarian: "vegetarian with eggs and dairy allowed but no meat",
    mediterranean: "Mediterranean with olive oil, fish, legumes, vegetables, and whole grains",
    keto: "ketogenic with very low carbs, high fat, and moderate protein",
    custom: "balanced with variety",
  };

  const preferencesText = [
    profile.allergies ? `- ALLERGIES (never include): ${profile.allergies}` : "",
    profile.dislikedFoods ? `- Foods to avoid (disliked): ${profile.dislikedFoods}` : "",
    profile.cuisinePreferences ? `- Preferred cuisines: ${profile.cuisinePreferences}` : "",
    (profile as { regenNotes?: string }).regenNotes ? `- Special requests for this plan: ${(profile as { regenNotes?: string }).regenNotes}` : "",
  ].filter(Boolean).join("\n");

  return `You are a professional nutritionist. Create a detailed 7-day meal plan for someone with these nutrition needs:

- Daily Calories: ${profile.dailyCalories} kcal
- Protein: ${profile.proteinG}g
- Carbohydrates: ${profile.carbsG}g
- Fat: ${profile.fatG}g
- Diet Style: ${dietDescriptions[dietStyle]}${preferencesText ? `\n${preferencesText}` : ""}

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "name": "7-Day ${dietStyle.replace("_", " ")} Meal Plan",
  "dietStyle": "${dietStyle}",
  "days": [
    {
      "day": "Monday",
      "breakfast": {
        "name": "meal name",
        "description": "brief description",
        "calories": 400,
        "proteinG": 30,
        "carbsG": 40,
        "fatG": 12,
        "servings": 1,
        "ingredients": ["1 cup oats", "1 banana"],
        "instructions": ["Step 1", "Step 2"],
        "prepTimeMin": 5,
        "cookTimeMin": 10
      },
      "lunch": { ... same structure ... },
      "dinner": { ... same structure ... },
      "snack": { ... same structure ... },
      "totalCalories": 1800,
      "totalProteinG": 120,
      "totalCarbsG": 180,
      "totalFatG": 60
    }
  ]
}

Create all 7 days (Monday through Sunday). Make meals delicious, practical, and varied. Ensure daily totals stay within 100 calories of ${profile.dailyCalories}.`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (userId) {
    const premium = await isPremium(userId);
    if (!premium) {
      const usage = await checkFreeUsage(userId);
      if (!usage.allowed) {
        return new Response(JSON.stringify({ error: "free_limit_reached" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  const body = await req.json();
  const { profile, dietStyle } = schema.parse(body);
  const prompt = buildPrompt(profile as NutritionProfile, dietStyle);

  let fullText = "";
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: "claude-opus-4-8",
          max_tokens: 16000,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        // Save to DB after stream completes
        if (userId) {
          try {
            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const mealPlan = JSON.parse(jsonMatch[0]);
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
          } catch (e) {
            console.error("DB save error:", e);
          }
        }

        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
