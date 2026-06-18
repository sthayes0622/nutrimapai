import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { jwtVerify } from "jose";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

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

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { query } = await req.json();
  if (!query || typeof query !== "string" || query.length > 100) {
    return NextResponse.json({ error: "invalid query" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `Give me 3 common food items matching "${query}" with their nutrition info per typical serving. Return ONLY valid JSON array, no other text:\n[{"name":"Food Name (serving size)","calories":100,"proteinG":5,"carbsG":10,"fatG":3}]`,
    }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return NextResponse.json({ suggestions: [] });

  try {
    const suggestions = JSON.parse(match[0]);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
