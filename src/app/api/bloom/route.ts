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

    // Calculate current Monday of the week
    const currentDay = new Date();
    const dayOfWeek = currentDay.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = currentDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(currentDay.setDate(diffToMonday));
    const weekStartStr = monday.toLocaleDateString("en-CA");

    let bloomRecord = await prisma.bloomScore.findUnique({
      where: { userId_weekStart: { userId, weekStart: weekStartStr } },
    });

    if (!bloomRecord) {
      // Create empty/default record if not exists
      bloomRecord = await prisma.bloomScore.create({
        data: {
          userId,
          weekStart: weekStartStr,
          score: 75, // default fallback
          adherence: 70,
          consistency: 80,
          variety: 60,
          hydration: 90,
        },
      });
    }

    return NextResponse.json(bloomRecord);
  } catch (err) {
    console.error("BloomScore GET error:", err);
    return NextResponse.json({ error: "Failed to fetch BloomScore" }, { status: 500 });
  }
}
