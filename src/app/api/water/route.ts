import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/water?date=
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toLocaleDateString("en-CA");

    const waterLog = await prisma.waterLog.findUnique({
      where: { userId_date: { userId, date } },
    });

    const goals = await prisma.goal.findUnique({
      where: { userId },
      select: { waterTargetMl: true },
    });

    return NextResponse.json({
      amountMl: waterLog ? waterLog.amountMl : 0,
      goalMl: goals ? goals.waterTargetMl : 2500,
    });
  } catch (err) {
    console.error("Water GET error:", err);
    return NextResponse.json({ error: "Failed to fetch water log" }, { status: 500 });
  }
}

// POST /api/water (set absolute amount)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { date, amountMl } = await req.json();
    const targetDate = date || new Date().toLocaleDateString("en-CA");

    const updated = await prisma.waterLog.upsert({
      where: { userId_date: { userId, date: targetDate } },
      create: { userId, date: targetDate, amountMl: Math.max(0, amountMl) },
      update: { amountMl: Math.max(0, amountMl) },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Water POST error:", err);
    return NextResponse.json({ error: "Failed to update water log" }, { status: 500 });
  }
}

// PATCH /api/water (increment/decrement by delta)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { date, delta } = await req.json();
    const targetDate = date || new Date().toLocaleDateString("en-CA");

    const existing = await prisma.waterLog.findUnique({
      where: { userId_date: { userId, date: targetDate } },
    });

    const currentAmount = existing ? existing.amountMl : 0;
    const newAmount = Math.max(0, currentAmount + delta);

    const updated = await prisma.waterLog.upsert({
      where: { userId_date: { userId, date: targetDate } },
      create: { userId, date: targetDate, amountMl: newAmount },
      update: { amountMl: newAmount },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Water PATCH error:", err);
    return NextResponse.json({ error: "Failed to adjust water log" }, { status: 500 });
  }
}
