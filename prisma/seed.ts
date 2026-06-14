import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  // Delete in correct order to avoid foreign key constraint issues
  await prisma.recipeIngredient.deleteMany({});
  await prisma.ingredient.deleteMany({});
  await prisma.savedRecipe.deleteMany({});
  await prisma.mealEntry.deleteMany({});
  await prisma.meal.deleteMany({});
  await prisma.nutritionLog.deleteMany({});
  await prisma.plannedMeal.deleteMany({});
  await prisma.groceryItem.deleteMany({});
  await prisma.groceryList.deleteMany({});
  await prisma.waterLog.deleteMany({});
  await prisma.moodLog.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.mealTemplateItem.deleteMany({});
  await prisma.mealTemplate.deleteMany({});
  await prisma.bloomScore.deleteMany({});
  await prisma.insight.deleteMany({});
  await prisma.recipe.deleteMany({});

  console.log("Seeding default recipes and ingredients...");

  const recipesData = [
    {
      title: "Avocado Toast",
      summary: "A quick and healthy classic avocado toast topped with cherry tomatoes and microgreens.",
      instructions: "1. Toast the whole grain bread. 2. Mash the avocado with lemon juice, salt, and pepper. 3. Spread on toast. 4. Top with halved cherry tomatoes and pumpkin seeds.",
      servings: 1,
      readyInMinutes: 10,
      cuisines: JSON.stringify(["American"]),
      diets: JSON.stringify(["Vegan", "Vegetarian"]),
      tags: JSON.stringify(["breakfast", "quick", "healthy"]),
      calories: 280,
      protein: 8,
      carbs: 24,
      fat: 18,
      fiber: 7,
      sugar: 3,
      ingredients: [
        { name: "Avocado", amount: 1, unit: "count", aisle: "Produce" },
        { name: "Whole Wheat Bread", amount: 2, unit: "slice", aisle: "Bakery" },
        { name: "Cherry Tomatoes", amount: 5, unit: "count", aisle: "Produce" },
        { name: "Lemon Juice", amount: 1, unit: "tsp", aisle: "Produce" },
        { name: "Pumpkin Seeds", amount: 1, unit: "tbsp", aisle: "Pantry" },
      ],
    },
    {
      title: "Grilled Chicken Salad",
      summary: "High protein Mediterranean style grilled chicken salad with crisp greens and lemon vinaigrette.",
      instructions: "1. Grill the chicken breast until cooked through. 2. Chop lettuce, cucumber, and tomatoes. 3. Slice the grilled chicken. 4. Toss everything with olive oil and lemon juice.",
      servings: 1,
      readyInMinutes: 20,
      cuisines: JSON.stringify(["Mediterranean", "American"]),
      diets: JSON.stringify(["Gluten Free", "High Protein"]),
      tags: JSON.stringify(["lunch", "salad", "high-protein"]),
      calories: 420,
      protein: 42,
      carbs: 12,
      fat: 22,
      fiber: 4,
      sugar: 5,
      ingredients: [
        { name: "Chicken Breast", amount: 150, unit: "grams", aisle: "Meat" },
        { name: "Romaine Lettuce", amount: 2, unit: "cups", aisle: "Produce" },
        { name: "Cucumber", amount: 0.5, unit: "count", aisle: "Produce" },
        { name: "Olive Oil", amount: 1, unit: "tbsp", aisle: "Pantry" },
        { name: "Lemon Vinaigrette", amount: 2, unit: "tbsp", aisle: "Pantry" },
      ],
    },
    {
      title: "Quinoa Buddha Bowl",
      summary: "A colorful plant-based bowl filled with fluffy quinoa, roasted sweet potatoes, chickpeas, and tahini dressing.",
      instructions: "1. Cook quinoa according to package directions. 2. Roast sweet potato cubes and chickpeas in the oven. 3. Assemble bowl with spinach, quinoa, potatoes, chickpeas, and sliced avocado. 4. Drizzle with tahini dressing.",
      servings: 2,
      readyInMinutes: 35,
      cuisines: JSON.stringify(["Global"]),
      diets: JSON.stringify(["Vegan", "Vegetarian", "Gluten Free"]),
      tags: JSON.stringify(["dinner", "lunch", "meal-prep"]),
      calories: 550,
      protein: 16,
      carbs: 72,
      fat: 24,
      fiber: 12,
      sugar: 8,
      ingredients: [
        { name: "Quinoa", amount: 1, unit: "cup", aisle: "Pantry" },
        { name: "Sweet Potato", amount: 1, unit: "medium", aisle: "Produce" },
        { name: "Chickpeas", amount: 1, unit: "can", aisle: "Canned Goods" },
        { name: "Spinach", amount: 2, unit: "cups", aisle: "Produce" },
        { name: "Tahini", amount: 2, unit: "tbsp", aisle: "Pantry" },
        { name: "Avocado", amount: 0.5, unit: "count", aisle: "Produce" },
      ],
    },
    {
      title: "Berry Protein Smoothie",
      summary: "A refreshing and creamy smoothie packed with antioxidants and whey protein.",
      instructions: "1. Add all ingredients to a high-speed blender. 2. Blend until completely smooth. 3. Pour into a glass and enjoy.",
      servings: 1,
      readyInMinutes: 5,
      cuisines: JSON.stringify(["American"]),
      diets: JSON.stringify(["Vegetarian", "High Protein", "Gluten Free"]),
      tags: JSON.stringify(["breakfast", "snack", "smoothie"]),
      calories: 320,
      protein: 30,
      carbs: 35,
      fat: 6,
      fiber: 8,
      sugar: 18,
      ingredients: [
        { name: "Mixed Berries", amount: 1, unit: "cup", aisle: "Frozen" },
        { name: "Whey Protein Powder", amount: 1, unit: "scoop", aisle: "Supplements" },
        { name: "Almond Milk", amount: 1, unit: "cup", aisle: "Dairy Alternative" },
        { name: "Chia Seeds", amount: 1, unit: "tbsp", aisle: "Pantry" },
        { name: "Banana", amount: 0.5, unit: "count", aisle: "Produce" },
      ],
    },
    {
      title: "Salmon with Sweet Potato & Broccoli",
      summary: "Rich in Omega-3 fatty acids, this clean dinner plate features baked salmon, sweet potato mash, and steamed broccoli.",
      instructions: "1. Season salmon fillet with salt, pepper, and dill, then bake at 400°F for 12-15 minutes. 2. Steam broccoli florets. 3. Boil and mash the sweet potato. 4. Serve together.",
      servings: 1,
      readyInMinutes: 25,
      cuisines: JSON.stringify(["American"]),
      diets: JSON.stringify(["Gluten Free", "High Protein"]),
      tags: JSON.stringify(["dinner", "healthy", "clean"]),
      calories: 510,
      protein: 38,
      carbs: 42,
      fat: 20,
      fiber: 8,
      sugar: 10,
      ingredients: [
        { name: "Salmon Fillet", amount: 180, unit: "grams", aisle: "Seafood" },
        { name: "Sweet Potato", amount: 1, unit: "large", aisle: "Produce" },
        { name: "Broccoli", amount: 1.5, unit: "cups", aisle: "Produce" },
        { name: "Olive Oil", amount: 1, unit: "tsp", aisle: "Pantry" },
      ],
    },
    {
      title: "Greek Yogurt Parfait",
      summary: "A creamy, crunchy Greek yogurt parfait layered with fresh berries, honey, and high-protein granola.",
      instructions: "1. Scoop Greek yogurt into a bowl or jar. 2. Top with strawberries, blueberries, and granola. 3. Drizzle with honey.",
      servings: 1,
      readyInMinutes: 5,
      cuisines: JSON.stringify(["Greek", "Mediterranean"]),
      diets: JSON.stringify(["Vegetarian", "High Protein"]),
      tags: JSON.stringify(["breakfast", "snack", "quick"]),
      calories: 290,
      protein: 20,
      carbs: 38,
      fat: 6,
      fiber: 4,
      sugar: 22,
      ingredients: [
        { name: "Greek Yogurt", amount: 200, unit: "grams", aisle: "Dairy" },
        { name: "Strawberries", amount: 5, unit: "count", aisle: "Produce" },
        { name: "Granola", amount: 0.25, unit: "cup", aisle: "Pantry" },
        { name: "Honey", amount: 1, unit: "tbsp", aisle: "Pantry" },
        { name: "Blueberries", amount: 0.25, unit: "cup", aisle: "Produce" },
      ],
    },
    {
      title: "Tofu Vegetable Stir-Fry",
      summary: "A savory, nutrient-dense vegan stir-fry featuring crispy tofu and a colorful mix of fresh vegetables.",
      instructions: "1. Press tofu and cut into cubes, then pan-sear until crispy. 2. Stir-fry broccoli, bell peppers, and snap peas. 3. Add tofu back and toss with soy sauce, garlic, and ginger sauce.",
      servings: 2,
      readyInMinutes: 20,
      cuisines: JSON.stringify(["Asian"]),
      diets: JSON.stringify(["Vegan", "Vegetarian", "Gluten Free"]),
      tags: JSON.stringify(["lunch", "dinner", "quick"]),
      calories: 340,
      protein: 18,
      carbs: 26,
      fat: 16,
      fiber: 6,
      sugar: 5,
      ingredients: [
        { name: "Extra Firm Tofu", amount: 250, unit: "grams", aisle: "Produce" },
        { name: "Bell Pepper", amount: 1, unit: "count", aisle: "Produce" },
        { name: "Broccoli Florets", amount: 1, unit: "cup", aisle: "Produce" },
        { name: "Soy Sauce", amount: 2, unit: "tbsp", aisle: "Pantry" },
        { name: "Sesame Oil", amount: 1, unit: "tbsp", aisle: "Pantry" },
        { name: "Garlic", amount: 2, unit: "cloves", aisle: "Produce" },
      ],
    },
  ];

  for (const recipe of recipesData) {
    // 1. Create the recipe
    const createdRecipe = await prisma.recipe.create({
      data: {
        title: recipe.title,
        summary: recipe.summary,
        instructions: recipe.instructions,
        servings: recipe.servings,
        readyInMinutes: recipe.readyInMinutes,
        cuisines: recipe.cuisines,
        diets: recipe.diets,
        tags: recipe.tags,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        fiber: recipe.fiber,
        sugar: recipe.sugar,
        isCustom: false,
      },
    });

    // 2. Connect ingredients
    for (const ing of recipe.ingredients) {
      // Find or create the ingredient
      const ingredient = await prisma.ingredient.upsert({
        where: { name: ing.name },
        update: { aisle: ing.aisle },
        create: { name: ing.name, aisle: ing.aisle },
      });

      // Link it to the recipe
      await prisma.recipeIngredient.create({
        data: {
          recipeId: createdRecipe.id,
          ingredientId: ingredient.id,
          amount: ing.amount,
          unit: ing.unit,
          original: `${ing.amount} ${ing.unit} of ${ing.name}`,
        },
      });
    }
  }

  console.log("Database successfully seeded with default recipes!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
