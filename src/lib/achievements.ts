import { prisma } from "@/lib/prisma";

export interface AchievementDefinition {
  type: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  first_meal: {
    type: "first_meal",
    title: "First Bite",
    description: "Logged your first ever meal on NutriBloom!",
    icon: "🍎",
  },
  streak_3: {
    type: "streak_3",
    title: "Three's Company",
    description: "Logged meals for 3 consecutive days.",
    icon: "🔥",
  },
  streak_7: {
    type: "streak_7",
    title: "Consistency Master",
    description: "Logged meals for 7 consecutive days.",
    icon: "⚡",
  },
  streak_30: {
    type: "streak_30",
    title: "Closed-Loop Nutritionist",
    description: "Logged meals for 30 consecutive days.",
    icon: "✨",
  },
  protein_king: {
    type: "protein_king",
    title: "Protein King",
    description: "Met your daily protein target 5 days in a row.",
    icon: "🥩",
  },
  calorie_sniper: {
    type: "calorie_sniper",
    title: "Calorie Sniper",
    description: "Stayed within 5% of your daily calorie goal 3 days in a row.",
    icon: "🎯",
  },
  veggie_week: {
    type: "veggie_week",
    title: "Green Warrior",
    description: "Logged only vegan or vegetarian recipes for 7 days.",
    icon: "🥗",
  },
  hydration_hero: {
    type: "hydration_hero",
    title: "Hydration Hero",
    description: "Met your daily water target 7 days in a row.",
    icon: "💧",
  },
  recipe_explorer: {
    type: "recipe_explorer",
    title: "Recipe Explorer",
    description: "Saved 10 or more recipes to your dashboard.",
    icon: "🧭",
  },
  bloom_80: {
    type: "bloom_80",
    title: "Bloom Elite",
    description: "Achieved a BloomScore over 80 this week.",
    icon: "🌸",
  },
};

export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  const unlockedAchievements: string[] = [];

  try {
    // Helper to award achievement
    const award = async (def: AchievementDefinition) => {
      const existing = await prisma.userAchievement.findUnique({
        where: { userId_type: { userId, type: def.type } },
      });
      if (!existing) {
        await prisma.userAchievement.create({
          data: {
            userId,
            type: def.type,
            title: def.title,
            description: def.description,
            icon: def.icon,
          },
        });
        unlockedAchievements.push(def.title);
      }
    };

    // 1. First Meal Achievement
    const totalMeals = await prisma.meal.count({ where: { userId } });
    if (totalMeals > 0) {
      await award(ACHIEVEMENTS.first_meal);
    }

    // Fetch goals
    const goals = await prisma.goal.findUnique({ where: { userId } });
    const calorieTarget = goals?.calorieTarget || 2000;
    const proteinTarget = goals?.proteinTarget || 150;
    const waterTarget = goals?.waterTargetMl || 2500;

    // Fetch all logs ordered by date
    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const waterLogs = await prisma.waterLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    // 2. Streaks checks (3, 7, 30 days)
    if (nutritionLogs.length >= 3) {
      let consecutive = 1;
      for (let i = 0; i < nutritionLogs.length - 1; i++) {
        const d1 = new Date(nutritionLogs[i].date);
        const d2 = new Date(nutritionLogs[i + 1].date);
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1 && nutritionLogs[i].mealsLogged > 0 && nutritionLogs[i + 1].mealsLogged > 0) {
          consecutive++;
        } else {
          break;
        }
      }
      if (consecutive >= 3) await award(ACHIEVEMENTS.streak_3);
      if (consecutive >= 7) await award(ACHIEVEMENTS.streak_7);
      if (consecutive >= 30) await award(ACHIEVEMENTS.streak_30);
    }

    // 3. Protein King (met target 5 days in a row)
    if (nutritionLogs.length >= 5) {
      let metDays = 0;
      for (let i = 0; i < 5; i++) {
        if (nutritionLogs[i].totalProtein >= proteinTarget) {
          metDays++;
        } else {
          break;
        }
      }
      if (metDays === 5) await award(ACHIEVEMENTS.protein_king);
    }

    // 4. Calorie Sniper (within 5% of goal 3 days in a row)
    if (nutritionLogs.length >= 3) {
      let sniperDays = 0;
      for (let i = 0; i < 3; i++) {
        const diff = Math.abs(nutritionLogs[i].totalCalories - calorieTarget) / calorieTarget;
        if (diff <= 0.05) {
          sniperDays++;
        } else {
          break;
        }
      }
      if (sniperDays === 3) await award(ACHIEVEMENTS.calorie_sniper);
    }

    // 5. Hydration Hero (water goal 7 days in a row)
    if (waterLogs.length >= 7) {
      let hitWaterDays = 0;
      for (let i = 0; i < 7; i++) {
        if (waterLogs[i].amountMl >= waterTarget) {
          hitWaterDays++;
        } else {
          break;
        }
      }
      if (hitWaterDays === 7) await award(ACHIEVEMENTS.hydration_hero);
    }

    // 6. Recipe Explorer (save 10+ recipes)
    const savedCount = await prisma.savedRecipe.count({ where: { userId } });
    if (savedCount >= 10) {
      await award(ACHIEVEMENTS.recipe_explorer);
    }

    // 7. Bloom Score Elite (BloomScore over 80)
    const bloomRecord = await prisma.bloomScore.findFirst({
      where: { userId, score: { gte: 80 } },
    });
    if (bloomRecord) {
      await award(ACHIEVEMENTS.bloom_80);
    }

    // 8. Veggie Week (vegan/vegetarian recipes for 7 days)
    // For simplicity, if they have logged meals for 7 days and all logged entries are veggie/vegan, award
    if (nutritionLogs.length >= 7) {
      const past7Dates = nutritionLogs.slice(0, 7).map((l) => l.date);
      const meals = await prisma.meal.findMany({
        where: { userId, date: { in: past7Dates } },
        include: { entries: { include: { recipe: true } } },
      });

      let allVeggie = true;
      let entriesCount = 0;

      for (const m of meals) {
        for (const e of m.entries) {
          entriesCount++;
          if (e.recipe) {
            const diets = JSON.parse(e.recipe.diets || "[]").map((d: string) => d.toLowerCase());
            const isVegOrVegan = diets.includes("vegetarian") || diets.includes("vegan");
            if (!isVegOrVegan) allVeggie = false;
          } else {
            // For custom entries, assume non-veggie unless they specify (so we play safe)
            allVeggie = false;
          }
        }
      }

      if (entriesCount > 0 && allVeggie) {
        await award(ACHIEVEMENTS.veggie_week);
      }
    }
  } catch (err) {
    console.error("Error checking achievements:", err);
  }

  return unlockedAchievements;
}
