import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    });

    let goals = await prisma.goal.findUnique({
      where: { userId },
    });
    if (!goals) {
      goals = await prisma.goal.create({ data: { userId } });
    }

    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });
    if (!preferences) {
      preferences = await prisma.userPreference.create({ data: { userId } });
    }

    return NextResponse.json({ profile, goals, preferences });
  } catch (err) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT /api/settings
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();

    const {
      name,
      image,
      calorieTarget,
      proteinTarget,
      carbTarget,
      fatTarget,
      dietType,
      waterTargetMl,
      cuisines,
      allergies,
      dislikedIngredients,
      maxPrepTime,
    } = body;

    await prisma.$transaction(async (tx) => {
      // 1. Update Profile (User table)
      await tx.user.update({
        where: { id: userId },
        data: {
          name,
          image,
        },
      });

      // 2. Update Goals
      await tx.goal.update({
        where: { userId },
        data: {
          calorieTarget: Number(calorieTarget) || 2000,
          proteinTarget: Number(proteinTarget) || 150,
          carbTarget: Number(carbTarget) || 250,
          fatTarget: Number(fatTarget) || 65,
          dietType: dietType || "balanced",
          waterTargetMl: Number(waterTargetMl) || 2500,
        },
      });

      // 3. Update Preferences
      await tx.userPreference.update({
        where: { userId },
        data: {
          cuisines: cuisines || "[]",
          allergies: allergies || "[]",
          dislikedIngredients: dislikedIngredients || "[]",
          maxPrepTime: Number(maxPrepTime) || 60,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Settings PUT error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

// DELETE /api/settings (danger zone: delete user account)
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Delete user (Prisma onDelete: Cascade handles linked tables)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Settings DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
