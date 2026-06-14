import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // 1. Calculate Monday (week start)
    const currentDay = new Date();
    const dayOfWeek = currentDay.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = currentDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(currentDay.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);

    const weekStartStr = monday.toLocaleDateString("en-CA");

    // Get all dates for the current week (Monday to Sunday)
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d.toLocaleDateString("en-CA"));
    }

    // 2. Fetch User Goals
    const goals = await prisma.goal.findUnique({
      where: { userId },
    });
    const calorieTarget = goals?.calorieTarget || 2000;
    const waterTargetMl = goals?.waterTargetMl || 2500;

    // 3. Fetch NutritionLogs for the week
    const logs = await prisma.nutritionLog.findMany({
      where: {
        userId,
        date: { in: weekDates },
      },
    });

    // 4. Calculate Adherence (40%) and Consistency (30%)
    let totalAdherence = 0;
    let daysWithMeals = 0;

    weekDates.forEach((dateStr) => {
      const log = logs.find((l) => l.date === dateStr);
      if (log && log.mealsLogged > 0) {
        daysWithMeals++;
        const cals = log.totalCalories;
        const diffPercent = Math.abs(cals - calorieTarget) / calorieTarget;

        if (diffPercent <= 0.15) {
          // Within 15% range
          totalAdherence += 100;
        } else {
          // Linear penalty outside 15%
          totalAdherence += Math.max(0, 100 - (diffPercent - 0.15) * 100);
        }
      }
    });

    const adherenceScore = totalAdherence / 7;
    const consistencyScore = (daysWithMeals / 7) * 100;

    // 5. Calculate Variety (20%)
    // Fetch all entries logged this week
    const meals = await prisma.meal.findMany({
      where: {
        userId,
        date: { in: weekDates },
      },
      include: {
        entries: true,
      },
    });

    const uniqueRecipeIds = new Set<string>();
    meals.forEach((m) => {
      m.entries.forEach((e) => {
        if (e.recipeId) {
          uniqueRecipeIds.add(e.recipeId);
        } else if (e.customName) {
          // Treat unique custom names as different recipes for variety
          uniqueRecipeIds.add(e.customName.toLowerCase());
        }
      });
    });

    const varietyScore = Math.min(100, (uniqueRecipeIds.size / 7) * 100);

    // 6. Calculate Hydration (10%)
    const waterLogs = await prisma.waterLog.findMany({
      where: {
        userId,
        date: { in: weekDates },
      },
    });

    let daysHitWaterGoal = 0;
    waterLogs.forEach((wl) => {
      if (wl.amountMl >= waterTargetMl) {
        daysHitWaterGoal++;
      }
    });

    const hydrationScore = (daysHitWaterGoal / 7) * 100;

    // 7. Calculate Final BloomScore
    const finalScore =
      adherenceScore * 0.4 +
      consistencyScore * 0.3 +
      varietyScore * 0.2 +
      hydrationScore * 0.1;

    // 8. Upsert BloomScore in DB
    const updatedScore = await prisma.bloomScore.upsert({
      where: { userId_weekStart: { userId, weekStart: weekStartStr } },
      create: {
        userId,
        weekStart: weekStartStr,
        score: finalScore,
        adherence: adherenceScore,
        consistency: consistencyScore,
        variety: varietyScore,
        hydration: hydrationScore,
      },
      update: {
        score: finalScore,
        adherence: adherenceScore,
        consistency: consistencyScore,
        variety: varietyScore,
        hydration: hydrationScore,
      },
    });

    return NextResponse.json(updatedScore);
  } catch (err) {
    console.error("Recalculate BloomScore error:", err);
    return NextResponse.json({ error: "Failed to recalculate BloomScore" }, { status: 500 });
  }
}
