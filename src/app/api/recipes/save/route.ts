import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkAndAwardAchievements } from "@/lib/achievements";

// GET /api/recipes/save (list saved recipes)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const saved = await prisma.savedRecipe.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Extract recipes from saved list
    const recipes = saved.map((s) => s.recipe);
    return NextResponse.json(recipes);
  } catch (err) {
    console.error("Saved Recipes GET error:", err);
    return NextResponse.json({ error: "Failed to fetch saved recipes" }, { status: 500 });
  }
}

// POST /api/recipes/save (toggle saved state)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { recipeId } = await req.json();

    if (!recipeId) {
      return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
    }

    // Check if already saved
    const existing = await prisma.savedRecipe.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    let saved = false;

    if (existing) {
      // Unsave
      await prisma.savedRecipe.delete({
        where: { userId_recipeId: { userId, recipeId } },
      });
    } else {
      // Save
      await prisma.savedRecipe.create({
        data: { userId, recipeId },
      });
      saved = true;
    }

    // Trigger achievements explorer check in background
    const newlyUnlocked = await checkAndAwardAchievements(userId);

    return NextResponse.json({ success: true, saved, newlyUnlocked });
  } catch (err) {
    console.error("Saved Recipes POST error:", err);
    return NextResponse.json({ error: "Failed to toggle saved recipe" }, { status: 500 });
  }
}
