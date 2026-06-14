-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spoonacularId" INTEGER,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "summary" TEXT,
    "instructions" TEXT,
    "servings" INTEGER NOT NULL DEFAULT 4,
    "readyInMinutes" INTEGER NOT NULL DEFAULT 30,
    "cuisines" TEXT NOT NULL DEFAULT '[]',
    "diets" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "sourceUrl" TEXT,
    "calories" REAL NOT NULL DEFAULT 0,
    "protein" REAL NOT NULL DEFAULT 0,
    "carbs" REAL NOT NULL DEFAULT 0,
    "fat" REAL NOT NULL DEFAULT 0,
    "fiber" REAL NOT NULL DEFAULT 0,
    "sugar" REAL NOT NULL DEFAULT 0,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "aisle" TEXT NOT NULL DEFAULT 'Other'
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT '',
    "original" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedRecipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealId" TEXT NOT NULL,
    "recipeId" TEXT,
    "customName" TEXT,
    "servings" REAL NOT NULL DEFAULT 1,
    "calories" REAL NOT NULL DEFAULT 0,
    "protein" REAL NOT NULL DEFAULT 0,
    "carbs" REAL NOT NULL DEFAULT 0,
    "fat" REAL NOT NULL DEFAULT 0,
    "fiber" REAL NOT NULL DEFAULT 0,
    "sugar" REAL NOT NULL DEFAULT 0,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealEntry_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MealEntry_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NutritionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "totalCalories" REAL NOT NULL DEFAULT 0,
    "totalProtein" REAL NOT NULL DEFAULT 0,
    "totalCarbs" REAL NOT NULL DEFAULT 0,
    "totalFat" REAL NOT NULL DEFAULT 0,
    "totalFiber" REAL NOT NULL DEFAULT 0,
    "totalSugar" REAL NOT NULL DEFAULT 0,
    "mealsLogged" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "NutritionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "calorieTarget" REAL NOT NULL DEFAULT 2000,
    "proteinTarget" REAL NOT NULL DEFAULT 150,
    "carbTarget" REAL NOT NULL DEFAULT 250,
    "fatTarget" REAL NOT NULL DEFAULT 65,
    "dietType" TEXT NOT NULL DEFAULT 'balanced',
    "waterTargetMl" INTEGER NOT NULL DEFAULT 2500,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cuisines" TEXT NOT NULL DEFAULT '[]',
    "allergies" TEXT NOT NULL DEFAULT '[]',
    "dislikedIngredients" TEXT NOT NULL DEFAULT '[]',
    "maxPrepTime" INTEGER NOT NULL DEFAULT 60,
    CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlannedMeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "servings" REAL NOT NULL DEFAULT 1,
    "calories" REAL NOT NULL DEFAULT 0,
    "protein" REAL NOT NULL DEFAULT 0,
    "carbs" REAL NOT NULL DEFAULT 0,
    "fat" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlannedMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlannedMeal_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroceryList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Grocery List',
    "startDate" TEXT,
    "endDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroceryList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroceryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT '',
    "aisle" TEXT NOT NULL DEFAULT 'Other',
    "checked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GroceryItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "GroceryList" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "data" TEXT NOT NULL DEFAULT '{}',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "amountMl" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MoodLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mood" INTEGER NOT NULL DEFAULT 3,
    "energy" INTEGER NOT NULL DEFAULT 3,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'custom',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealTemplateItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "recipeId" TEXT,
    "customName" TEXT,
    "mealType" TEXT NOT NULL,
    "servings" REAL NOT NULL DEFAULT 1,
    "calories" REAL NOT NULL DEFAULT 0,
    "protein" REAL NOT NULL DEFAULT 0,
    "carbs" REAL NOT NULL DEFAULT 0,
    "fat" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "MealTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MealTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MealTemplateItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BloomScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "adherence" REAL NOT NULL DEFAULT 0,
    "consistency" REAL NOT NULL DEFAULT 0,
    "variety" REAL NOT NULL DEFAULT 0,
    "hydration" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BloomScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_spoonacularId_key" ON "Recipe"("spoonacularId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SavedRecipe_userId_recipeId_key" ON "SavedRecipe"("userId", "recipeId");

-- CreateIndex
CREATE INDEX "Meal_userId_date_idx" ON "Meal"("userId", "date");

-- CreateIndex
CREATE INDEX "NutritionLog_userId_date_idx" ON "NutritionLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionLog_userId_date_key" ON "NutritionLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_userId_key" ON "Goal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "PlannedMeal_userId_date_idx" ON "PlannedMeal"("userId", "date");

-- CreateIndex
CREATE INDEX "Insight_userId_createdAt_idx" ON "Insight"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WaterLog_userId_date_idx" ON "WaterLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WaterLog_userId_date_key" ON "WaterLog"("userId", "date");

-- CreateIndex
CREATE INDEX "MoodLog_userId_date_idx" ON "MoodLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MoodLog_userId_date_key" ON "MoodLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_type_key" ON "UserAchievement"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "BloomScore_userId_weekStart_key" ON "BloomScore"("userId", "weekStart");
