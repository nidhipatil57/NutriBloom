import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/planner?startDate=&endDate=
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing date parameters" }, { status: 400 });
    }

    const planned = await prisma.plannedMeal.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        recipe: true,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(planned);
  } catch (err) {
    console.error("Planner GET error:", err);
    return NextResponse.json({ error: "Failed to fetch planned meals" }, { status: 500 });
  }
}

// POST /api/planner
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { date, mealType, recipeId, servings } = await req.json();

    if (!date || !mealType || !recipeId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Fetch the recipe details to cache macros
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const numServings = Number(servings) || 1;

    const planned = await prisma.plannedMeal.create({
      data: {
        userId,
        date,
        mealType,
        recipeId,
        servings: numServings,
        calories: recipe.calories * numServings,
        protein: recipe.protein * numServings,
        carbs: recipe.carbs * numServings,
        fat: recipe.fat * numServings,
      },
      include: {
        recipe: true,
      },
    });

    return NextResponse.json(planned);
  } catch (err) {
    console.error("Planner POST error:", err);
    return NextResponse.json({ error: "Failed to plan meal" }, { status: 500 });
  }
}

// DELETE /api/planner?id=
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const planned = await prisma.plannedMeal.findUnique({
      where: { id },
    });

    if (!planned || planned.userId !== userId) {
      return NextResponse.json({ error: "Planned meal not found" }, { status: 404 });
    }

    await prisma.plannedMeal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Planner DELETE error:", err);
    return NextResponse.json({ error: "Failed to remove planned meal" }, { status: 500 });
  }
}
