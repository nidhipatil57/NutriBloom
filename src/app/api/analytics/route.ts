import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "week"; // "week" | "month"

    const daysCount = range === "month" ? 30 : 7;

    // Fetch goals
    const goals = await prisma.goal.findUnique({
      where: { userId },
    });

    // Generate date list for range
    const dates: string[] = [];
    const dateLabels: string[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString("en-CA"));
      dateLabels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }

    // Fetch daily logs
    const logs = await prisma.nutritionLog.findMany({
      where: {
        userId,
        date: { in: dates },
      },
    });

    // Format daily data
    let totalCalsSum = 0;
    let totalProteinSum = 0;
    let totalCarbsSum = 0;
    let totalFatSum = 0;
    let trackedDaysCount = 0;

    const dailyData = dates.map((dateStr, index) => {
      const log = logs.find((l) => l.date === dateStr);
      if (log && log.mealsLogged > 0) {
        trackedDaysCount++;
        totalCalsSum += log.totalCalories;
        totalProteinSum += log.totalProtein;
        totalCarbsSum += log.totalCarbs;
        totalFatSum += log.totalFat;
      }

      return {
        date: dateStr,
        label: dateLabels[index],
        calories: log ? Math.round(log.totalCalories) : 0,
        protein: log ? Math.round(log.totalProtein) : 0,
        carbs: log ? Math.round(log.totalCarbs) : 0,
        fat: log ? Math.round(log.totalFat) : 0,
      };
    });

    // Calculate averages
    const avgCalories = trackedDaysCount > 0 ? Math.round(totalCalsSum / trackedDaysCount) : 0;
    const avgProtein = trackedDaysCount > 0 ? Math.round(totalProteinSum / trackedDaysCount) : 0;
    const avgCarbs = trackedDaysCount > 0 ? Math.round(totalCarbsSum / trackedDaysCount) : 0;
    const avgFat = trackedDaysCount > 0 ? Math.round(totalFatSum / trackedDaysCount) : 0;

    const goalHitRate =
      trackedDaysCount > 0
        ? Math.round(
            (logs.filter((log) => {
              const target = goals?.calorieTarget || 2000;
              const diff = Math.abs(log.totalCalories - target) / target;
              return diff <= 0.15 && log.mealsLogged > 0;
            }).length /
              trackedDaysCount) *
              100
          )
        : 0;

    return NextResponse.json({
      dailyData,
      averages: {
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFat,
        trackedDaysCount,
        goalHitRate,
      },
      goals: {
        calorieTarget: goals?.calorieTarget || 2000,
        proteinTarget: goals?.proteinTarget || 150,
        carbTarget: goals?.carbTarget || 250,
        fatTarget: goals?.fatTarget || 65,
      },
    });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
