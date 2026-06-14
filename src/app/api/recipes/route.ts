import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/recipes?q=&cuisine=&diet=&maxCalories=&minProtein=&page=
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const diet = searchParams.get("diet") || "";
    const maxCalories = Number(searchParams.get("maxCalories")) || 0;
    const minProtein = Number(searchParams.get("minProtein")) || 0;
    const page = Number(searchParams.get("page")) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    // Filter query
    const where: any = {};
    if (q) {
      where.title = { contains: q };
    }
    if (maxCalories > 0) {
      where.calories = { lte: maxCalories };
    }
    if (minProtein > 0) {
      where.protein = { gte: minProtein };
    }

    let recipes = await prisma.recipe.findMany({
      where,
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    // Post-filtering for cuisines & diets stored as JSON strings
    if (cuisine) {
      recipes = recipes.filter((r) => {
        try {
          const arr = JSON.parse(r.cuisines || "[]") as string[];
          return arr.some((c) => c.toLowerCase() === cuisine.toLowerCase());
        } catch {
          return false;
        }
      });
    }

    if (diet) {
      recipes = recipes.filter((r) => {
        try {
          const arr = JSON.parse(r.diets || "[]") as string[];
          return arr.some((d) => d.toLowerCase() === diet.toLowerCase());
        } catch {
          return false;
        }
      });
    }

    // Interleave Veg and Non-Veg recipes
    const veg = recipes.filter((r) => {
      try {
        const diets = JSON.parse(r.diets || "[]").map((d: string) => d.toLowerCase());
        return diets.includes("vegetarian") || diets.includes("vegan");
      } catch {
        return false;
      }
    });

    const nonVeg = recipes.filter((r) => {
      try {
        const diets = JSON.parse(r.diets || "[]").map((d: string) => d.toLowerCase());
        return !diets.includes("vegetarian") && !diets.includes("vegan");
      } catch {
        return true; // default to non-veg if parsing fails
      }
    });

    const interleaved: typeof recipes = [];
    const maxLen = Math.max(veg.length, nonVeg.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < veg.length) interleaved.push(veg[i]);
      if (i < nonVeg.length) interleaved.push(nonVeg[i]);
    }

    const totalCount = interleaved.length;
    const paginatedRecipes = interleaved.slice(skip, skip + limit);

    return NextResponse.json({
      recipes: paginatedRecipes,
      totalCount,
    });
  } catch (err) {
    console.error("Recipes GET error:", err);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}
