import { NextRequest, NextResponse } from "next/server";
import { generateGroceryList } from "@/lib/claude";
import type { MealPlan } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const mealPlan: MealPlan = await req.json();

    if (!mealPlan.days || mealPlan.days.length === 0) {
      return NextResponse.json({ error: "Invalid meal plan" }, { status: 400 });
    }

    const groceryList = await generateGroceryList(mealPlan);

    return NextResponse.json(groceryList);
  } catch (error) {
    console.error("Grocery list generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate grocery list. Please try again." },
      { status: 500 }
    );
  }
}
