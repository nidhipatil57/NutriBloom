import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET/POST /api/planner/autopilot
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { startDate, endDate } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing date range" }, { status: 400 });
    }

    // 1. Fetch user goals and preferences
    const goals = await prisma.goal.findUnique({ where: { userId } });
    const prefs = await prisma.userPreference.findUnique({ where: { userId } });
    const saved = await prisma.savedRecipe.findMany({
      where: { userId },
      include: { recipe: true },
    });

    const dietType = goals?.dietType || "balanced";
    const calorieTarget = goals?.calorieTarget || 2000;
    const allergiesList = JSON.parse(prefs?.allergies || "[]");
    const cuisinesList = JSON.parse(prefs?.cuisines || "[]");

    // Get all dates in the range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateStrings: string[] = [];
    const tempDate = new Date(start);
    while (tempDate <= end) {
      dateStrings.push(tempDate.toLocaleDateString("en-CA"));
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // 2. Fetch all recipes from DB to choose from
    let allRecipes = await prisma.recipe.findMany();

    // If no recipes in DB, we'll return an error or wait until seeded
    if (allRecipes.length === 0) {
      return NextResponse.json({
        error: "No recipes found in the database. Please run the seed script or create custom recipes first.",
      }, { status: 400 });
    }

    // Filter recipes based on diet type
    let filteredRecipes = allRecipes;
    if (dietType === "vegan") {
      filteredRecipes = allRecipes.filter((r) => r.diets.toLowerCase().includes("vegan"));
    } else if (dietType === "vegetarian") {
      filteredRecipes = allRecipes.filter(
        (r) => r.diets.toLowerCase().includes("vegetarian") || r.diets.toLowerCase().includes("vegan")
      );
    } else if (dietType === "keto") {
      filteredRecipes = allRecipes.filter((r) => r.carbs <= 30);
    } else if (dietType === "high-protein") {
      filteredRecipes = allRecipes.filter((r) => r.protein >= 30);
    }

    if (filteredRecipes.length === 0) {
      // Fallback to all recipes if filtering is too strict
      filteredRecipes = allRecipes;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyPlaceholder = !apiKey || apiKey.startsWith("gemini-placeholder") || (!apiKey.startsWith("AIzaSy") && !apiKey.startsWith("AQ."));

    const plannedList: any[] = [];

    // Clear existing planned meals in this range first to prevent duplicates
    await prisma.plannedMeal.deleteMany({
      where: {
        userId,
        date: { in: dateStrings },
      },
    });

    if (isApiKeyPlaceholder) {
      // ── SMART FALLBACK RECOMMENDATION ALGORITHM ──
      // Populate dates one by one with randomized selections matching their targets
      for (const dStr of dateStrings) {
        const mealTypes = ["Breakfast", "Lunch", "Dinner"];
        for (const type of mealTypes) {
          // Select recipe (prefer saved recipes if they match)
          let candidates = filteredRecipes;
          const savedMatching = saved.filter((s) => filteredRecipes.some((f) => f.id === s.recipeId));
          if (savedMatching.length > 0 && Math.random() > 0.4) {
            candidates = savedMatching.map((s) => s.recipe);
          }

          // Pick random candidate
          const randomIndex = Math.floor(Math.random() * candidates.length);
          const recipe = candidates[randomIndex];

          const planned = await prisma.plannedMeal.create({
            data: {
              userId,
              date: dStr,
              mealType: type,
              recipeId: recipe.id,
              servings: 1,
              calories: recipe.calories,
              protein: recipe.protein,
              carbs: recipe.carbs,
              fat: recipe.fat,
            },
          });
          plannedList.push(planned);
        }
      }
    } else {
      // ── GEMINI AI AUTOPILOT GENERATOR ──
      const systemPrompt = `You are a nutrition planning AI. Create a 7-day meal plan from the following list of recipe IDs:
      ${filteredRecipes.map((r) => `ID: ${r.id} | Title: ${r.title} | Cals: ${r.calories} | Protein: ${r.protein} | Diets: ${r.diets}`).join("\n")}
      
      User Target: ${calorieTarget} kcal/day. Diet Type: ${dietType}. Allergies: ${allergiesList.join(", ")}.
      
      Generate a JSON response that maps each of the following dates to a set of meals:
      Dates: ${dateStrings.join(", ")}
      
      Return ONLY a JSON array of objects structured as:
      [
        { "date": "YYYY-MM-DD", "mealType": "Breakfast"|"Lunch"|"Dinner", "recipeId": "string" }
      ]`;

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          const responseText = resJson.candidates[0].content.parts[0].text;
          const parsedPlan = JSON.parse(responseText.trim());

          for (const item of parsedPlan) {
            const recipe = allRecipes.find((r) => r.id === item.recipeId);
            if (recipe) {
              const planned = await prisma.plannedMeal.create({
                data: {
                  userId,
                  date: item.date,
                  mealType: item.mealType,
                  recipeId: recipe.id,
                  servings: 1,
                  calories: recipe.calories,
                  protein: recipe.protein,
                  carbs: recipe.carbs,
                  fat: recipe.fat,
                },
              });
              plannedList.push(planned);
            }
          }
        } else {
          throw new Error("Gemini API request failed");
        }
      } catch (err) {
        console.error("Gemini Autopilot error, falling back to smart recommendation:", err);
        // Fallback to randomized
        for (const dStr of dateStrings) {
          for (const type of ["Breakfast", "Lunch", "Dinner"]) {
            const recipe = filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
            const planned = await prisma.plannedMeal.create({
              data: {
                userId,
                date: dStr,
                mealType: type,
                recipeId: recipe.id,
                servings: 1,
                calories: recipe.calories,
                protein: recipe.protein,
                carbs: recipe.carbs,
                fat: recipe.fat,
              },
            });
            plannedList.push(planned);
          }
        }
      }
    }

    return NextResponse.json({ success: true, count: plannedList.length });
  } catch (err) {
    console.error("Planner Autopilot POST error:", err);
    return NextResponse.json({ error: "Failed to run planner Autopilot" }, { status: 500 });
  }
}
