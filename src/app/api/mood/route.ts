import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/mood?date=
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toLocaleDateString("en-CA");

    const log = await prisma.moodLog.findUnique({
      where: { userId_date: { userId, date } },
    });

    return NextResponse.json(log || { mood: 3, energy: 3, note: "" });
  } catch (err) {
    console.error("Mood GET error:", err);
    return NextResponse.json({ error: "Failed to fetch mood log" }, { status: 500 });
  }
}

// POST /api/mood
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { date, mood, energy, note } = await req.json();
    const targetDate = date || new Date().toLocaleDateString("en-CA");

    const log = await prisma.moodLog.upsert({
      where: { userId_date: { userId, date: targetDate } },
      create: {
        userId,
        date: targetDate,
        mood: Number(mood) || 3,
        energy: Number(energy) || 3,
        note: note || "",
      },
      update: {
        mood: Number(mood) || 3,
        energy: Number(energy) || 3,
        note: note || "",
      },
    });

    return NextResponse.json(log);
  } catch (err) {
    console.error("Mood POST error:", err);
    return NextResponse.json({ error: "Failed to upsert mood log" }, { status: 500 });
  }
}
