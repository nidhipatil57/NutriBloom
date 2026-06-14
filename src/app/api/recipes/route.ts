import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    const limit = 100;
    const skip = (page - 1) * limit;

    const apiKey = process.env.SPOONACULAR_API_KEY;
    const hasSpoonacular = apiKey && apiKey !== "your-spoonacular-api-key-here";

    // ── SPOONACULAR API CACHING PROXY ──
    if (hasSpoonacular && (q || cuisine || diet)) {
      try {
        const spoonUrl = new URL("https://api.spoonacular.com/recipes/complexSearch");
        spoonUrl.searchParams.append("apiKey", apiKey);
        spoonUrl.searchParams.append("addRecipeInformation", "true");
        spoonUrl.searchParams.append("addRecipeNutrition", "true");
        spoonUrl.searchParams.append("fillIngredients", "true");
        spoonUrl.searchParams.append("number", "15"); // fetch candidates to cache

        if (q) spoonUrl.searchParams.append("query", q);
        if (cuisine) spoonUrl.searchParams.append("cuisine", cuisine);
        if (diet) spoonUrl.searchParams.append("diet", diet);

        const response = await fetch(spoonUrl.toString());

        if (response.ok) {
          const data = await response.json();
          const results = data.results || [];

          for (const recipe of results) {
            // Verify if recipe already cached in DB
            const existing = await prisma.recipe.findUnique({
              where: { spoonacularId: recipe.id },
            });

            if (!existing) {
              const nutrients = recipe.nutrition?.nutrients || [];
              const getNutrient = (name: string) =>
                nutrients.find((n: any) => n.name.toLowerCase() === name.toLowerCase())?.amount || 0;

              const calories = getNutrient("calories");
              const protein = getNutrient("protein");
              const carbs = getNutrient("carbohydrates");
              const fat = getNutrient("fat");
              const fiber = getNutrient("fiber");
              const sugar = getNutrient("sugar");

              // Format clean step-by-step instructions
              const rawInstructions = recipe.instructions || recipe.analyzedInstructions?.[0]?.steps?.map((s: any) => `${s.number}. ${s.step}`).join("\n") || "Plate and enjoy.";

              const created = await prisma.recipe.create({
                data: {
                  spoonacularId: recipe.id,
                  title: recipe.title,
                  image: recipe.image || null,
                  summary: recipe.summary || "",
                  instructions: rawInstructions,
                  servings: recipe.servings || 1,
                  readyInMinutes: recipe.readyInMinutes || 30,
                  cuisines: JSON.stringify(recipe.cuisines || []),
                  diets: JSON.stringify(recipe.diets || []),
                  tags: JSON.stringify(recipe.dishTypes || []),
                  sourceUrl: recipe.sourceUrl || null,
                  calories,
                  protein,
                  carbs,
                  fat,
                  fiber,
                  sugar,
                  isCustom: false,
                },
              });

              // Create ingredient records and links
              if (recipe.extendedIngredients && Array.isArray(recipe.extendedIngredients)) {
                for (const ing of recipe.extendedIngredients) {
                  if (!ing.name) continue;
                  const ingName = ing.name.trim().toLowerCase();

                  const dbIngredient = await prisma.ingredient.upsert({
                    where: { name: ingName },
                    update: { aisle: ing.aisle || "Other" },
                    create: { name: ingName, aisle: ing.aisle || "Other" },
                  });

                  await prisma.recipeIngredient.create({
                    data: {
                      recipeId: created.id,
                      ingredientId: dbIngredient.id,
                      amount: ing.amount || 1,
                      unit: ing.unit || "",
                      original: ing.original || `${ing.amount} ${ing.unit} ${ing.name}`,
                    },
                  });
                }
              }
            }
          }
        }
      } catch (spoonErr) {
        console.error("Spoonacular API proxy failure, falling back to local DB cache:", spoonErr);
      }
    }

    // ── LOCAL DB QUERY ──
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

    // Filter cuisines & diets stored as stringified arrays
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

    const popularityScore = (title: string): number => {
      const t = title.toLowerCase();
      if (t.includes("biryani")) return 100;
      if (t.includes("paneer butter masala")) return 99;
      if (t.includes("classic butter chicken") || t.includes("butter chicken")) return 98;
      if (t.includes("dal tadka") || t.includes("lentil tadka")) return 97;
      if (t.includes("chana masala") || t.includes("chickpea curry")) return 96;
      if (t.includes("palak paneer") || t.includes("spinach cottage cheese")) return 95;
      if (t.includes("avocado toast")) return 94;
      if (t.includes("egg bhurji")) return 93;
      if (t.includes("aloo gobi")) return 92;
      if (t.includes("grilled chicken salad")) return 91;
      if (t.includes("mango lassi")) return 90;
      if (t.includes("carrot halwa") || t.includes("gajar ka halwa")) return 89;
      if (t.includes("rice kheer") || t.includes("rice pudding")) return 88;
      if (t.includes("quesadilla")) return 87;
      if (t.includes("fajita")) return 86;
      if (t.includes("shakshuka")) return 85;
      if (t.includes("salmon")) return 84;
      if (t.includes("parfait")) return 83;
      if (t.includes("oatmeal")) return 82;
      if (t.includes("shrimp pasta")) return 81;
      if (t.includes("wrap")) return 80;
      if (t.includes("buddha bowl")) return 79;
      if (t.includes("stir-fry") || t.includes("tofu")) return 78;
      if (t.includes("smoothie")) return 77;
      if (t.includes("chia chocolate pudding") || t.includes("chia pudding")) return 76;
      return 50;
    };

    // Interleave Veg/Non-Veg
    const veg = recipes.filter((r) => {
      try {
        const dietsArr = JSON.parse(r.diets || "[]").map((d: string) => d.toLowerCase());
        return dietsArr.includes("vegetarian") || dietsArr.includes("vegan");
      } catch {
        return false;
      }
    }).sort((a, b) => popularityScore(b.title) - popularityScore(a.title));

    const nonVeg = recipes.filter((r) => {
      try {
        const dietsArr = JSON.parse(r.diets || "[]").map((d: string) => d.toLowerCase());
        return !dietsArr.includes("vegetarian") && !dietsArr.includes("vegan");
      } catch {
        return true;
      }
    }).sort((a, b) => popularityScore(b.title) - popularityScore(a.title));

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
