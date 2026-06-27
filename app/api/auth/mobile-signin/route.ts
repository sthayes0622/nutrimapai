import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Brute-force protection: lock the account after 5 failed attempts for 15 min.
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const attempts = user.failedLoginCount + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: attempts,
          lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Successful login — reset the failed-attempt counter.
    if (user.failedLoginCount > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: 0, lockedUntil: null },
      });
    }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const token = await new SignJWT({ id: user.id, email: user.email, name: user.name })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secret);

    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Mobile signin error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
