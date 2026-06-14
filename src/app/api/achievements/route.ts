import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json(achievements);
  } catch (err) {
    console.error("Achievements GET error:", err);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}
