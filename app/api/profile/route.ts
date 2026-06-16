import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { jwtVerify } from "jose";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(req: NextRequest): Promise<string | null> {
  // Try Bearer token (mobile)
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
      const { payload } = await jwtVerify(auth.slice(7), secret);
      return payload.id as string;
    } catch {}
  }
  // Try NextAuth session (web)
  const session = await getServerSession(authOptions);
  if (session?.user) return (session.user as { id: string }).id;
  return null;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.nutritionProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ profile: null });

  return NextResponse.json({
    profile: {
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
    }
  });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const profile = await prisma.nutritionProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json(profile);
}
