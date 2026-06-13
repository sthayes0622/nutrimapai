import Anthropic from "@anthropic-ai/sdk";
import type { DietStyle, MealPlan, GroceryList, NutritionProfile } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-opus-4-8";

export async function generateMealPlan(
  profile: NutritionProfile,
  dietStyle: DietStyle
): Promise<MealPlan> {
  const dietDescriptions: Record<DietStyle, string> = {
    balanced: "balanced with a mix of all macronutrients",
    high_protein: "high-protein focused on lean meats, eggs, and protein-rich foods",
    vegan: "100% plant-based with no animal products",
    vegetarian: "vegetarian with eggs and dairy allowed but no meat",
    mediterranean: "Mediterranean with olive oil, fish, legumes, vegetables, and whole grains",
    keto: "ketogenic with very low carbs, high fat, and moderate protein",
    custom: "balanced with variety",
  };

  const prompt = `You are a professional nutritionist. Create a detailed 7-day meal plan for someone with these nutrition needs:

- Daily Calories: ${profile.dailyCalories} kcal
- Protein: ${profile.proteinG}g
- Carbohydrates: ${profile.carbsG}g
- Fat: ${profile.fatG}g
- Diet Style: ${dietDescriptions[dietStyle]}

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

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
  });

  const message = await stream.finalMessage();
  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse meal plan from AI response");

  return JSON.parse(jsonMatch[0]) as MealPlan;
}

export async function generateGroceryList(mealPlan: MealPlan): Promise<GroceryList> {
  const allIngredients = mealPlan.days
    .flatMap((day) =>
      [day.breakfast, day.lunch, day.dinner, day.snack]
        .filter(Boolean)
        .flatMap((meal) => meal!.ingredients)
    )
    .join("\n");

  const prompt = `You are a professional meal prep organizer. Based on these ingredients from a 7-day meal plan, create a consolidated grocery list organized by store section.

Ingredients needed:
${allIngredients}

Consolidate duplicates, combine quantities where possible, and organize by category.

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "categories": [
    {
      "category": "Produce",
      "items": [
        { "name": "Bananas", "quantity": "7", "unit": "each" },
        { "name": "Spinach", "quantity": "2", "unit": "bags" }
      ]
    },
    {
      "category": "Proteins",
      "items": [...]
    },
    {
      "category": "Dairy & Eggs",
      "items": [...]
    },
    {
      "category": "Grains & Bread",
      "items": [...]
    },
    {
      "category": "Canned & Pantry",
      "items": [...]
    },
    {
      "category": "Frozen",
      "items": [...]
    },
    {
      "category": "Condiments & Spices",
      "items": [...]
    }
  ]
}`;

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const message = await stream.finalMessage();
  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse grocery list from AI response");

  return JSON.parse(jsonMatch[0]) as GroceryList;
}
