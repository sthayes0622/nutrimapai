import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { profile, dietStyle, day, mealType } = await req.json();

  const dietDescriptions: Record<string, string> = {
    balanced: "balanced with a mix of all macronutrients",
    high_protein: "high-protein focused on lean meats, eggs, and protein-rich foods",
    vegan: "100% plant-based with no animal products",
    vegetarian: "vegetarian with eggs and dairy allowed but no meat",
    mediterranean: "Mediterranean with olive oil, fish, legumes, vegetables, and whole grains",
    keto: "ketogenic with very low carbs, high fat, and moderate protein",
    custom: "balanced with variety",
  };

  const mealCalories = {
    breakfast: Math.round(profile.dailyCalories * 0.25),
    lunch: Math.round(profile.dailyCalories * 0.35),
    dinner: Math.round(profile.dailyCalories * 0.30),
    snack: Math.round(profile.dailyCalories * 0.10),
  }[mealType] || Math.round(profile.dailyCalories * 0.25);

  const preferencesText = [
    profile.allergies ? `- ALLERGIES (never include): ${profile.allergies}` : "",
    profile.dislikedFoods ? `- Foods to avoid: ${profile.dislikedFoods}` : "",
  ].filter(Boolean).join("\n");

  const prompt = `You are a professional nutritionist. Generate ONE alternative ${mealType} meal for ${day}.

Diet: ${dietDescriptions[dietStyle] || "balanced"}
Target calories: ~${mealCalories} kcal
Protein target: ~${Math.round(profile.proteinG * (mealCalories / profile.dailyCalories))}g
${preferencesText}

Return ONLY valid JSON (no markdown):
{
  "name": "meal name",
  "description": "brief description",
  "calories": ${mealCalories},
  "proteinG": 25,
  "carbsG": 40,
  "fatG": 12,
  "servings": 1,
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["Step 1", "Step 2"],
  "prepTimeMin": 10,
  "cookTimeMin": 15
}`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("");
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "Failed to generate meal" }, { status: 500 });

  return NextResponse.json({ meal: JSON.parse(jsonMatch[0]) });
}
