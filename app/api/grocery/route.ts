import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { jwtVerify } from "jose";
import { authOptions } from "@/lib/auth";
import { generateGroceryList } from "@/lib/claude";
import { isPremium } from "@/lib/subscription";
import type { MealPlan } from "@/lib/types";

export const maxDuration = 300;

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

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
