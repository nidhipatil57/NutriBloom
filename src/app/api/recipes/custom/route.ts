import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkAndAwardAchievements } from "@/lib/achievements";

// GET /api/recipes/custom
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Get recipes created by the current user
    const customRecipes = await prisma.recipe.findMany({
      where: { createdBy: userId, isCustom: true },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return NextResponse.json(customRecipes);
  } catch (err) {
    console.error("Custom Recipes GET error:", err);
    return NextResponse.json({ error: "Failed to fetch custom recipes" }, { status: 500 });
  }
}

// POST /api/recipes/custom
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();

    const {
      title,
      servings,
      readyInMinutes,
      ingredients, // Array of { name, amount, unit, calories, protein, carbs, fat }
    } = body;

    if (!title || !ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: "Title and at least one ingredient required" }, { status: 400 });
    }

    // Sum up totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    ingredients.forEach((ing: any) => {
      totalCalories += (Number(ing.calories) || 0);
      totalProtein += (Number(ing.protein) || 0);
      totalCarbs += (Number(ing.carbs) || 0);
      totalFat += (Number(ing.fat) || 0);
    });

    // Create custom recipe in a transaction
    const recipe = await prisma.$transaction(async (tx) => {
      // 1. Create Recipe
      const r = await tx.recipe.create({
        data: {
          title,
          servings: Number(servings) || 4,
          readyInMinutes: Number(readyInMinutes) || 30,
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          isCustom: true,
          createdBy: userId,
          image: null,
          instructions: "Custom recipe created by user.",
        },
      });

      // 2. Loop through and create ingredients/links
      for (const ing of ingredients) {
        const ingName = ing.name.trim().toLowerCase();
        // Check if global ingredient exists
        let dbIng = await tx.ingredient.findUnique({
          where: { name: ingName },
        });

        if (!dbIng) {
          dbIng = await tx.ingredient.create({
            data: {
              name: ingName,
              aisle: "Other",
            },
          });
        }

        // Link
        await tx.recipeIngredient.create({
          data: {
            recipeId: r.id,
            ingredientId: dbIng.id,
            amount: Number(ing.amount) || 1,
            unit: ing.unit || "g",
            original: `${ing.amount} ${ing.unit} ${ing.name}`,
          },
        });
      }

      // 3. Auto-save recipe to SavedRecipe
      await tx.savedRecipe.create({
        data: {
          userId,
          recipeId: r.id,
        },
      });

      return r;
    });

    // Recalculate achievements in background (SavedRecipe count changed)
    const newlyUnlocked = await checkAndAwardAchievements(userId);

    return NextResponse.json({ success: true, recipe, newlyUnlocked });
  } catch (err) {
    console.error("Custom Recipes POST error:", err);
    return NextResponse.json({ error: "Failed to create custom recipe" }, { status: 500 });
  }
}

// DELETE /api/recipes/custom?id=
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
      return NextResponse.json({ error: "Missing recipe id" }, { status: 400 });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe || recipe.createdBy !== userId) {
      return NextResponse.json({ error: "Recipe not found or unauthorized" }, { status: 404 });
    }

    // Delete custom recipe (cascade handlesSavedRecipe & RecipeIngredient)
    await prisma.recipe.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Custom Recipes DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete custom recipe" }, { status: 500 });
  }
}
