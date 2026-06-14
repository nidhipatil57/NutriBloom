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

// GET /api/meals?date=
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toLocaleDateString("en-CA");

    const meals = await prisma.meal.findMany({
      where: { userId, date },
      include: {
        entries: {
          include: {
            recipe: true,
          },
        },
      },
    });

    return NextResponse.json(meals);
  } catch (err) {
    console.error("Meals GET error:", err);
    return NextResponse.json({ error: "Failed to fetch meals" }, { status: 500 });
  }
}

// POST /api/meals
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();

    const {
      date,
      mealType, // e.g. "Breakfast", "Lunch", "Dinner", "Snack"
      recipeId,
      customName,
      servings,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
    } = body;

    const targetDate = date || new Date().toLocaleDateString("en-CA");

    // 1. Find or create the meal container (by date and meal type)
    let meal = await prisma.meal.findFirst({
      where: {
        userId,
        date: targetDate,
        mealType,
      },
    });

    if (!meal) {
      meal = await prisma.meal.create({
        data: {
          userId,
          date: targetDate,
          mealType,
        },
      });
    }

    // 2. Create the meal entry
    const entry = await prisma.mealEntry.create({
      data: {
        mealId: meal.id,
        recipeId: recipeId || null,
        customName: customName || null,
        servings: Number(servings) || 1,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0,
        sugar: Number(sugar) || 0,
      },
    });

    // 3. Recalculate daily totals
    await recalculateNutritionLog(userId, targetDate);

    // 4. Check achievements
    const newlyUnlocked = await checkAndAwardAchievements(userId);

    return NextResponse.json({ success: true, entry, newlyUnlocked });
  } catch (err) {
    console.error("Meals POST error:", err);
    return NextResponse.json({ error: "Failed to log meal entry" }, { status: 500 });
  }
}

// DELETE /api/meals?entryId=
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const entryId = searchParams.get("entryId");

    if (!entryId) {
      return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
    }

    // Get the entry to find the associated mealId & date
    const entry = await prisma.mealEntry.findUnique({
      where: { id: entryId },
      include: {
        meal: true,
      },
    });

    if (!entry || entry.meal.userId !== userId) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { date, id: mealId } = entry.meal;

    // Delete the entry
    await prisma.mealEntry.delete({
      where: { id: entryId },
    });

    // Clean up empty meal if no entries left
    const remainingEntries = await prisma.mealEntry.count({
      where: { mealId },
    });

    if (remainingEntries === 0) {
      await prisma.meal.delete({
        where: { id: mealId },
      });
    }

    // Recalculate nutrition log
    await recalculateNutritionLog(userId, date);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Meals DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete meal entry" }, { status: 500 });
  }
}
