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
      image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600",
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
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
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
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
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
      image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600",
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
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600",
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
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600",
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
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600",
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
    {
      title: "Mediterranean Chickpea Salad",
      summary: "A bright, refreshing combination of crisp cucumbers, cherry tomatoes, olives, feta, and protein-rich chickpeas.",
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600",
      instructions: "1. Drain and rinse chickpeas. 2. Chop cucumber, cherry tomatoes, and red onion. 3. Combine in a large bowl with kalamata olives and crumbled feta cheese. 4. Toss with olive oil, lemon juice, and dried oregano.",
      servings: 2,
      readyInMinutes: 15,
      cuisines: JSON.stringify(["Mediterranean"]),
      diets: JSON.stringify(["Vegetarian", "Gluten Free"]),
      tags: JSON.stringify(["lunch", "salad", "healthy"]),
      calories: 310,
      protein: 12,
      carbs: 28,
      fat: 16,
      fiber: 6,
      sugar: 4,
      ingredients: [
        { name: "Chickpeas", amount: 1, unit: "can", aisle: "Canned Goods" },
        { name: "Cucumber", amount: 1, unit: "count", aisle: "Produce" },
        { name: "Cherry Tomatoes", amount: 1, unit: "cup", aisle: "Produce" },
        { name: "Feta Cheese", amount: 50, unit: "grams", aisle: "Dairy" },
        { name: "Kalamata Olives", amount: 10, unit: "count", aisle: "Canned Goods" },
        { name: "Olive Oil", amount: 1, unit: "tbsp", aisle: "Pantry" },
      ],
    },
    {
      title: "Oatmeal with Banana & Chia",
      summary: "Warm, comforting oats topped with sliced bananas, chia seeds, and a touch of organic maple syrup.",
      image: "https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?auto=format&fit=crop&q=80&w=600",
      instructions: "1. Cook oats in water or plant milk on the stove until creamy. 2. Slice the banana. 3. Transfer oats to a bowl, arrange banana slices on top, and sprinkle with chia seeds and cinnamon. 4. Drizzle with maple syrup.",
      servings: 1,
      readyInMinutes: 8,
      cuisines: JSON.stringify(["American"]),
      diets: JSON.stringify(["Vegan", "Vegetarian"]),
      tags: JSON.stringify(["breakfast", "warm", "quick"]),
      calories: 290,
      protein: 9,
      carbs: 48,
      fat: 6,
      fiber: 10,
      sugar: 12,
      ingredients: [
        { name: "Rolled Oats", amount: 0.5, unit: "cup", aisle: "Pantry" },
        { name: "Banana", amount: 1, unit: "count", aisle: "Produce" },
        { name: "Chia Seeds", amount: 1, unit: "tbsp", aisle: "Pantry" },
        { name: "Almond Milk", amount: 1, unit: "cup", aisle: "Dairy Alternative" },
        { name: "Maple Syrup", amount: 1, unit: "tsp", aisle: "Pantry" },
      ],
    },
    {
      title: "Garlic Butter Shrimp Pasta",
      summary: "Succulent shrimp tossed in garlic butter sauce with whole wheat spaghetti and fresh parsley.",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
      instructions: "1. Cook whole wheat pasta according to instructions. 2. Sauté minced garlic in butter and olive oil until fragrant. 3. Add peeled shrimp and cook for 3-4 minutes until pink. 4. Toss pasta with shrimp, garlic butter, and fresh chopped parsley.",
      servings: 2,
      readyInMinutes: 20,
      cuisines: JSON.stringify(["Italian"]),
      diets: JSON.stringify(["High Protein"]),
      tags: JSON.stringify(["dinner", "pasta", "seafood"]),
      calories: 480,
      protein: 34,
      carbs: 52,
      fat: 14,
      fiber: 4,
      sugar: 2,
      ingredients: [
        { name: "Shrimp", amount: 250, unit: "grams", aisle: "Seafood" },
        { name: "Whole Wheat Spaghetti", amount: 120, unit: "grams", aisle: "Pantry" },
        { name: "Garlic", amount: 4, unit: "cloves", aisle: "Produce" },
        { name: "Butter", amount: 1.5, unit: "tbsp", aisle: "Dairy" },
        { name: "Olive Oil", amount: 1, unit: "tbsp", aisle: "Pantry" },
        { name: "Parsley", amount: 0.25, unit: "cup", aisle: "Produce" },
      ],
    },
    {
      title: "Lentil Coconut Curry",
      summary: "A rich, creamy, and warm lentil curry simmered in coconut milk, ginger, garlic, and aromatic spices.",
      image: "https://images.unsplash.com/photo-1545093149-618ce3bcf49d?auto=format&fit=crop&q=80&w=600",
      instructions: "1. Sauté chopped onion, garlic, and grated ginger in a pan. 2. Stir in curry powder, turmeric, and cumin. 3. Add dry red lentils, diced tomatoes, vegetable broth, and coconut milk. 4. Simmer for 20 minutes until lentils are soft. Garnish with cilantro.",
      servings: 3,
      readyInMinutes: 30,
      cuisines: JSON.stringify(["Indian"]),
      diets: JSON.stringify(["Vegan", "Vegetarian", "Gluten Free"]),
      tags: JSON.stringify(["dinner", "curry", "comfort-food"]),
      calories: 380,
      protein: 18,
      carbs: 45,
      fat: 12,
      fiber: 14,
      sugar: 5,
      ingredients: [
        { name: "Red Lentils", amount: 1, unit: "cup", aisle: "Pantry" },
        { name: "Coconut Milk", amount: 1, unit: "can", aisle: "Canned Goods" },
        { name: "Diced Tomatoes", amount: 1, unit: "can", aisle: "Canned Goods" },
        { name: "Onion", amount: 1, unit: "count", aisle: "Produce" },
        { name: "Curry Powder", amount: 1, unit: "tbsp", aisle: "Pantry" },
        { name: "Vegetable Broth", amount: 1.5, unit: "cups", aisle: "Pantry" },
      ],
    },
    {
      title: "Turkey & Avocado Wrap",
      summary: "Fresh turkey breast slices, smashed avocado, and crisp butter lettuce wrapped in a high-fiber whole wheat tortilla.",
      image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=600",
      instructions: "1. Lay the tortilla flat and spread mashed avocado across the surface. 2. Layer turkey breast slices, baby spinach, and sliced tomato. 3. Fold sides in and roll tightly. 4. Cut in half and serve.",
      servings: 1,
      readyInMinutes: 5,
      cuisines: JSON.stringify(["American"]),
      diets: JSON.stringify(["High Protein"]),
      tags: JSON.stringify(["lunch", "wrap", "quick"]),
      calories: 360,
      protein: 28,
      carbs: 22,
      fat: 18,
      fiber: 8,
      sugar: 1,
      ingredients: [
        { name: "Whole Wheat Tortilla", amount: 1, unit: "count", aisle: "Bakery" },
        { name: "Turkey Breast Slices", amount: 100, unit: "grams", aisle: "Meat" },
        { name: "Avocado", amount: 0.5, unit: "count", aisle: "Produce" },
        { name: "Baby Spinach", amount: 0.5, unit: "cup", aisle: "Produce" },
        { name: "Tomato", amount: 0.5, unit: "count", aisle: "Produce" },
      ],
    },
    {
      title: "High-Protein Egg Shakshuka",
      summary: "Classic Middle Eastern breakfast dish featuring eggs poached in a rich, spicy tomato and bell pepper sauce.",
      image: "https://images.unsplash.com/photo-1590412200988-a436bb705300?auto=format&fit=crop&q=80&w=600",
      instructions: "1. Sauté chopped onion, garlic, and red bell pepper in olive oil until soft. 2. Stir in crushed tomatoes, paprika, cumin, and chili flakes. Simmer for 10 minutes. 3. Make small wells in the sauce and crack eggs into them. 4. Cover and cook on low heat for 5-8 minutes until egg whites are set. Garnish with fresh parsley.",
      servings: 2,
      readyInMinutes: 20,
      cuisines: JSON.stringify(["Middle Eastern"]),
      diets: JSON.stringify(["Vegetarian", "Gluten Free"]),
      tags: JSON.stringify(["breakfast", "eggs", "spicy"]),
      calories: 270,
      protein: 16,
      carbs: 14,
      fat: 17,
      fiber: 3,
      sugar: 6,
      ingredients: [
        { name: "Eggs", amount: 4, unit: "count", aisle: "Dairy" },
        { name: "Crushed Tomatoes", amount: 1, unit: "can", aisle: "Canned Goods" },
        { name: "Red Bell Pepper", amount: 1, unit: "count", aisle: "Produce" },
        { name: "Onion", amount: 0.5, unit: "count", aisle: "Produce" },
        { name: "Olive Oil", amount: 1, unit: "tbsp", aisle: "Pantry" },
        { name: "Cumin", amount: 1, unit: "tsp", aisle: "Pantry" },
      ],
    },
  ];

  for (const recipe of recipesData) {
    // 1. Create the recipe
    const createdRecipe = await prisma.recipe.create({
      data: {
        title: recipe.title,
        summary: recipe.summary,
        image: recipe.image,
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
