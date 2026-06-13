import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateGroceryList } from "@/lib/claude";
import { isPremium } from "@/lib/subscription";
import type { MealPlan } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    // Grocery list is a premium-only feature (or comes with the free meal plan)
    if (userId) {
      const premium = await isPremium(userId);
      // Allow free users to generate grocery list for their one free meal plan
      // Premium users have unlimited
      void premium; // gating is on meal plan generation
    }

    const mealPlan: MealPlan = await req.json();
    if (!mealPlan.days?.length) {
      return NextResponse.json({ error: "Invalid meal plan" }, { status: 400 });
    }

    const groceryList = await generateGroceryList(mealPlan);
    return NextResponse.json(groceryList);
  } catch (error) {
    console.error("Grocery list error:", error);
    return NextResponse.json({ error: "Failed to generate grocery list." }, { status: 500 });
  }
}
