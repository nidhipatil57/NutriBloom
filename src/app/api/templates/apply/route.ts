import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkAndAwardAchievements } from "@/lib/achievements";

// Helper to recalculate NutritionLog
async function recalculateNutritionLog(userId: string, date: string) {
  const dayMeals = await prisma.meal.findMany({
    where: { userId, date },
    include: { entries: true },
  });

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSugar = 0;
  let mealsLogged = 0;

  dayMeals.forEach((meal) => {
    if (meal.entries.length > 0) {
      mealsLogged++;
      meal.entries.forEach((entry) => {
        totalCalories += entry.calories * entry.servings;
        totalProtein += entry.protein * entry.servings;
        totalCarbs += entry.carbs * entry.servings;
        totalFat += entry.fat * entry.servings;
        totalFiber += entry.fiber * entry.servings;
        totalSugar += entry.sugar * entry.servings;
      });
    }
  });

  await prisma.nutritionLog.upsert({
    where: { userId_date: { userId, date } },
    create: {
      userId,
      date,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      totalSugar,
      mealsLogged,
    },
    update: {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      totalSugar,
      mealsLogged,
    },
  });
}

// POST /api/templates/apply
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();
    const { templateId, date } = body;

    if (!templateId || !date) {
      return NextResponse.json({ error: "Template ID and date are required" }, { status: 400 });
    }

    const template = await prisma.mealTemplate.findUnique({
      where: { id: templateId },
      include: { items: true },
    });

    if (!template || template.userId !== userId) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const mealTypes = Array.from(new Set(template.items.map((item) => item.mealType)));

    for (const mType of mealTypes) {
      let meal = await prisma.meal.findFirst({
        where: { userId, date, mealType: mType },
      });

      if (!meal) {
        meal = await prisma.meal.create({
          data: { userId, date, mealType: mType },
        });
      }

      const itemsForMType = template.items.filter((item) => item.mealType === mType);
      for (const item of itemsForMType) {
        await prisma.mealEntry.create({
          data: {
            mealId: meal.id,
            recipeId: item.recipeId,
            customName: item.customName,
            servings: item.servings,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
          },
        });
      }
    }

    // Recalculate daily totals
    await recalculateNutritionLog(userId, date);

    // Check achievements
    const newlyUnlocked = await checkAndAwardAchievements(userId);

    return NextResponse.json({ success: true, newlyUnlocked });
  } catch (err) {
    console.error("Template apply error:", err);
    return NextResponse.json({ error: "Failed to apply template" }, { status: 500 });
  }
}
