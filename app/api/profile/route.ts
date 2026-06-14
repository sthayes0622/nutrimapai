import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const profile = await prisma.nutritionProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json(null);

  return NextResponse.json({
    age: profile.age,
    sex: profile.sex,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
    dietStyle: profile.dietStyle,
    dailyCalories: profile.dailyCalories,
    proteinG: profile.proteinG,
    carbsG: profile.carbsG,
    fatG: profile.fatG,
    dislikedFoods: profile.dislikedFoods ?? "",
    allergies: profile.allergies ?? "",
    cuisinePreferences: profile.cuisinePreferences ?? "",
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const data = await req.json();

  const profile = await prisma.nutritionProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json(profile);
}
