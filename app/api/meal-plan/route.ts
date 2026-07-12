import { NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { jwtVerify } from "jose";
import { authOptions } from "@/lib/auth";
import { isPremium, checkFreeUsage, incrementUsage } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import type { NutritionProfile, DietStyle } from "@/lib/types";

async function getUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
      const { payload } = await jwtVerify(auth.slice(7), secret);
      return payload.id as string;
    } catch {}
  }
  const session = await getServerSession(authOptions);
  if (session?.user) return (session.user as { id: string }).id;
  return null;
}

export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Returns the user's most recently generated meal plan so it persists across
// logins and devices (the app previously only kept it in local storage).
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const latest = await prisma.mealPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return new Response(JSON.stringify({ mealPlan: null }), { headers: { "Content-Type": "application/json" } });

  return new Response(JSON.stringify({
    mealPlan: { name: latest.name, dietStyle: latest.dietStyle, days: latest.days },
  }), { headers: { "Content-Type": "application/json" } });
}

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

// Builds a prompt for a CHUNK of days (2-3), so the week is generated in a few
// parallel calls rather than 7. This keeps each call fast while minimizing the
// number of API calls (less rate-limit pressure when many users generate).
function buildChunkPrompt(
  profile: NutritionProfile & { dislikedFoods?: string; allergies?: string; cuisinePreferences?: string },
  dietStyle: DietStyle,
  dayNames: string[]
) {
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
    (profile as { regenNotes?: string }).regenNotes ? `- Special requests: ${(profile as { regenNotes?: string }).regenNotes}` : "",
  ].filter(Boolean).join("\n");

  return `You are a professional nutritionist. Create these days (${dayNames.join(", ")}) of a meal plan for:

- Daily Calories: ${profile.dailyCalories} kcal
- Protein: ${profile.proteinG}g
- Carbohydrates: ${profile.carbsG}g
- Fat: ${profile.fatG}g
- Diet Style: ${dietDescriptions[dietStyle]}${preferencesText ? `\n${preferencesText}` : ""}

Return ONLY a valid JSON array of day objects (no markdown, no explanation), one object per day in this exact structure:
[
  {
    "day": "${dayNames[0]}",
    "breakfast": { "name": "meal name", "description": "brief description", "calories": 400, "proteinG": 30, "carbsG": 40, "fatG": 12, "servings": 1, "ingredients": ["1 cup oats", "1 banana"], "instructions": ["Step 1", "Step 2"], "prepTimeMin": 5, "cookTimeMin": 10 },
    "lunch": { ...same structure... },
    "dinner": { ...same structure... },
    "snack": { ...same structure... },
    "totalCalories": ${profile.dailyCalories},
    "totalProteinG": ${profile.proteinG},
    "totalCarbsG": ${profile.carbsG},
    "totalFatG": ${profile.fatG}
  }
]

Include all of these days: ${dayNames.join(", ")}. Make meals delicious, practical, and varied across days. Keep each day's totals within 100 calories of ${profile.dailyCalories}.`;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// Split the week into chunks so it's generated in a few parallel calls.
const DAY_CHUNKS = [["Monday", "Tuesday", "Wednesday"], ["Thursday", "Friday"], ["Saturday", "Sunday"]];

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);

  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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

    // Hard daily cap for ALL users (including premium) to prevent runaway
    // API cost from abuse. 25/day is far above any real user's needs.
    const DAILY_CAP = 25;
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { mealPlansToday: true, mealPlansTodayResetAt: true },
    });
    if (u) {
      const now = new Date();
      const reset = new Date(u.mealPlansTodayResetAt);
      const newDay =
        now.getFullYear() !== reset.getFullYear() ||
        now.getMonth() !== reset.getMonth() ||
        now.getDate() !== reset.getDate();
      if (newDay) {
        await prisma.user.update({ where: { id: userId }, data: { mealPlansToday: 1, mealPlansTodayResetAt: now } });
      } else if (u.mealPlansToday >= DAILY_CAP) {
        return new Response(JSON.stringify({ error: "daily_limit_reached" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await prisma.user.update({ where: { id: userId }, data: { mealPlansToday: { increment: 1 } } });
      }
    }
  }

  const body = await req.json();
  const { profile, dietStyle } = schema.parse(body);

  try {
    // Generates a chunk of days (returns an array), retrying up to 4 times with
    // growing backoff so a transient Anthropic rate-limit doesn't fail the plan.
    const generateChunk = async (dayNames: string[]): Promise<unknown[]> => {
      let lastErr: unknown;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 6000,
            messages: [{ role: "user", content: buildChunkPrompt(profile as NutritionProfile, dietStyle, dayNames) }],
          });
          const text = message.content[0].type === "text" ? message.content[0].text : "";
          const match = text.match(/\[[\s\S]*\]/);
          if (!match) throw new Error(`No JSON array for ${dayNames.join(",")}`);
          const parsed = JSON.parse(match[0]);
          if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Empty chunk");
          return parsed;
        } catch (err) {
          lastErr = err;
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
      throw lastErr;
    };

    // Generate the 3 chunks in parallel — only 3 API calls per plan (low
    // rate-limit pressure) while staying fast (~25s), then flatten to 7 days.
    const chunkResults = await Promise.all(DAY_CHUNKS.map((c) => generateChunk(c)));
    const dayResults = chunkResults.flat();

    const mealPlan = {
      name: `7-Day ${dietStyle.replace("_", " ")} Meal Plan`,
      dietStyle,
      days: dayResults,
    };

    // Save to DB and count usage for free users
    if (userId) {
      try {
        await prisma.mealPlan.create({
          data: { userId, name: mealPlan.name, days: mealPlan.days as object[], dietStyle: mealPlan.dietStyle },
        });
        const premium = await isPremium(userId);
        if (!premium) await incrementUsage(userId);
      } catch (e) {
        console.error("DB save error:", e);
      }
    }

    return new Response(JSON.stringify(mealPlan), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Meal plan generation error:", e);
    return new Response(JSON.stringify({ error: "generation_failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
