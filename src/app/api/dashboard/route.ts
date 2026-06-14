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
    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local format

    // 1. Fetch user goals (upsert fallback if not exists)
    let goals = await prisma.goal.findUnique({
      where: { userId },
    });
    if (!goals) {
      goals = await prisma.goal.create({
        data: { userId },
      });
    }

    // 2. Fetch user preferences (upsert fallback)
    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });
    if (!preferences) {
      await prisma.userPreference.create({
        data: { userId },
      });
    }

    // 3. Fetch today's nutrition log
    let todayLog = await prisma.nutritionLog.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });
    if (!todayLog) {
      todayLog = {
        id: "",
        userId,
        date: todayStr,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        totalSugar: 0,
        mealsLogged: 0,
      };
    }

    // 4. Fetch today's meals with entries and optional recipe titles
    const meals = await prisma.meal.findMany({
      where: { userId, date: todayStr },
      include: {
        entries: {
          include: {
            recipe: {
              select: { title: true },
            },
          },
        },
      },
    });

    // Format meals for timeline
    const formattedMeals = ["Breakfast", "Lunch", "Dinner"].map((mealType) => {
      const found = meals.find((m) => m.mealType.toLowerCase() === mealType.toLowerCase());
      const entries = found
        ? found.entries.map((e) => ({
            id: e.id,
            customName: e.customName,
            recipeTitle: e.recipe?.title || null,
            calories: e.calories,
            protein: e.protein,
          }))
        : [];
      const caloriesSum = entries.reduce((acc, curr) => acc + curr.calories, 0);

      return {
        mealType,
        caloriesSum,
        entries,
      };
    });

    // 5. Fetch top 5 insights
    const insights = await prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 6. Fetch past 7 days' calories for AreaChart
    const past7Days: Array<{ day: string; calories: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toLocaleDateString("en-CA");
      const log = await prisma.nutritionLog.findUnique({
        where: { userId_date: { userId, date: dStr } },
      });
      past7Days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        calories: log ? Math.round(log.totalCalories) : 0,
      });
    }

    // 7. Fetch today's water log (upsert fallback)
    let waterLog = await prisma.waterLog.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });
    if (!waterLog) {
      waterLog = {
        id: "",
        userId,
        date: todayStr,
        amountMl: 0,
        updatedAt: new Date(),
      };
    }

    // 8. Fetch current week's BloomScore
    // Calculate current Monday of the week
    const currentDay = new Date();
    const dayOfWeek = currentDay.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = currentDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(currentDay.setDate(diffToMonday));
    const weekStartStr = monday.toLocaleDateString("en-CA");

    const bloomRecord = await prisma.bloomScore.findUnique({
      where: { userId_weekStart: { userId, weekStart: weekStartStr } },
    });
    const bloomScore = bloomRecord ? Math.round(bloomRecord.score) : 75; // fallback default

    // 9. Fetch user achievements (top 4 unlocked)
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
      take: 4,
    });

    return NextResponse.json({
      goals,
      todayLog,
      meals: formattedMeals,
      insights,
      weeklyCalories: past7Days,
      waterLog,
      bloomScore,
      achievements,
    });
  } catch (err: any) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
