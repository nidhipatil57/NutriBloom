"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Heart, 
  Plus, 
  Clock, 
  Users, 
  X, 
  Calendar, 
  Utensils, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface Ingredient {
  ingredient: {
    name: string;
    aisle: string;
  };
  amount: number;
  unit: string;
  original: string;
}

interface Recipe {
  id: string;
  title: string;
  image: string | null;
  summary: string | null;
  instructions: string | null;
  servings: number;
  readyInMinutes: number;
  cuisines: string;
  diets: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isCustom: boolean;
  ingredients?: Ingredient[];
}

export default function RecipesPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<"discover" | "saved" | "custom">("discover");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [logRecipe, setLogRecipe] = useState<Recipe | null>(null);
  
  // Log Meal Form
  const [logDate, setLogDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [logMealType, setLogMealType] = useState("Breakfast");
  const [logServings, setLogServings] = useState(1);
  const [isLogging, setIsLogging] = useState(false);

  // Fetch Saved Recipe IDs to show active hearts
  const fetchSavedRecipeIds = async () => {
    try {
      const res = await fetch("/api/recipes/save");
      if (res.ok) {
        const json: Recipe[] = await res.json();
        setSavedRecipes(json);
        setSavedIds(new Set(json.map((r) => r.id)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "discover") {
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (selectedDiet) params.append("diet", selectedDiet);
        if (selectedCuisine) params.append("cuisine", selectedCuisine);
        
        const res = await fetch(`/api/recipes?${params.toString()}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          setRecipes(json.recipes || []);
        } else {
          error("Failed to load recipes.");
        }
      } else if (activeTab === "saved") {
        const res = await fetch("/api/recipes/save", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          setSavedRecipes(json);
          setSavedIds(new Set(json.map((r: Recipe) => r.id)));
        } else {
          error("Failed to load saved recipes.");
        }
      } else if (activeTab === "custom") {
        const res = await fetch("/api/recipes/custom", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          setCustomRecipes(json);
        } else {
          error("Failed to load your custom recipes.");
        }
      }
    } catch (err) {
      console.error(err);
      error("Error loading recipes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedRecipeIds();
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [activeTab, searchQuery, selectedDiet, selectedCuisine]);

  const handleToggleSave = async (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await fetch("/api/recipes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.saved) {
          success("Recipe saved!");
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.add(recipeId);
            return next;
          });
        } else {
          success("Recipe removed from saved list.");
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(recipeId);
            return next;
          });
        }
        // Refresh appropriate lists
        fetchSavedRecipeIds();
        if (activeTab === "saved") {
          fetchRecipes();
        }
      } else {
        error("Failed to save recipe.");
      }
    } catch (err) {
      console.error(err);
      error("Error saving recipe.");
    }
  };

  const handleLogMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logRecipe) return;
    setIsLogging(true);
    try {
      // Calculate scaled macros
      const scale = logServings / logRecipe.servings;
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: logDate,
          mealType: logMealType,
          recipeId: logRecipe.id,
          customName: logRecipe.title,
          servings: logServings,
          calories: logRecipe.calories * scale,
          protein: logRecipe.protein * scale,
          carbs: logRecipe.carbs * scale,
          fat: logRecipe.fat * scale,
        }),
      });

      if (res.ok) {
        success(`Successfully logged ${logRecipe.title} to ${logMealType}!`);
        setLogRecipe(null);
      } else {
        error("Failed to log meal.");
      }
    } catch (err) {
      console.error(err);
      error("Error logging meal.");
    } finally {
      setIsLogging(false);
    }
  };

  const currentList = 
    activeTab === "discover" ? recipes :
    activeTab === "saved" ? savedRecipes :
    customRecipes;

  const displayedRecipes = currentList.filter((recipe) => {
    if (vegOnly) {
      try {
        const dietsArr = JSON.parse(recipe.diets || "[]").map((d: string) => d.toLowerCase());
        return dietsArr.includes("vegetarian") || dietsArr.includes("vegan");
      } catch {
        return false;
      }
    }
    return true;
  });

  const diets = ["Vegan", "Vegetarian", "Gluten Free", "High Protein"];
  const cuisines = ["Italian", "Mexican", "Asian", "Indian", "Mediterranean", "American", "Middle Eastern"];

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
        
        {/* Header Panel */}
        <div className="glass-card" style={{ padding: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "var(--primary)" }} />
              <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>Recipe Vault</h2>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Explore chef-curated healthy recipes, bookmark your favorites, or construct your own macro-balanced creations.
            </p>
          </div>
          <Link href="/recipes/create" className="btn btn-primary" style={{ gap: "8px" }}>
            <Plus size={16} />
            <span>Create Custom Recipe</span>
          </Link>
        </div>

        {/* Tabs Menu */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "1px" }}>
          <button
            onClick={() => setActiveTab("discover")}
            style={{
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 600,
              background: "none",
              border: "none",
              borderBottom: activeTab === "discover" ? "3px solid var(--primary)" : "3px solid transparent",
              color: activeTab === "discover" ? "var(--primary-light)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all var(--transition)"
            }}
          >
            Discover Recipes
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            style={{
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 600,
              background: "none",
              border: "none",
              borderBottom: activeTab === "saved" ? "3px solid var(--primary)" : "3px solid transparent",
              color: activeTab === "saved" ? "var(--primary-light)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all var(--transition)"
            }}
          >
            Saved Recipes ({savedRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            style={{
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 600,
              background: "none",
              border: "none",
              borderBottom: activeTab === "custom" ? "3px solid var(--primary)" : "3px solid transparent",
              color: activeTab === "custom" ? "var(--primary-light)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all var(--transition)"
            }}
          >
            My Custom Creations
          </button>
        </div>

        {/* Filters (only visible for Discover) */}
        {activeTab === "discover" && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search Box */}
            <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
              <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search recipes by name..."
                className="input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
            </div>

            {/* Diet filter */}
            <select
              className="input"
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value)}
              style={{ width: "180px" }}
            >
              <option value="">Any Diet</option>
              {diets.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Cuisine filter */}
            <select
              className="input"
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              style={{ width: "180px" }}
            >
              <option value="">Any Cuisine</option>
              {cuisines.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Veg Only Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg-elevated)", padding: "0 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", height: "42px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Veg Only</span>
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                style={{
                  position: "relative",
                  width: "42px",
                  height: "22px",
                  borderRadius: "100px",
                  background: vegOnly ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                  padding: 0
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: vegOnly ? "22px" : "2px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    transition: "left 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
                  }}
                />
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: "340px" }} />
            ))}
          </div>
        ) : displayedRecipes.length === 0 ? (
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 32px", textAlign: "center", gap: "16px" }}>
            <BookOpen size={48} style={{ color: "var(--text-muted)" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No recipes found</h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "400px" }}>
              {activeTab === "discover" 
                ? "We couldn't find any recipes matching your filters. Try adjusting your query parameters."
                : activeTab === "saved" 
                  ? "You haven't bookmarked any recipes yet. Find recipes in Discover and save them for instant access!"
                  : "You haven't built any custom recipes yet. Tap 'Create Custom Recipe' above to log your first!"}
            </p>
          </div>
        ) : (
          /* Recipes Grid */
          <div className="grid-3">
            {displayedRecipes.map((recipe) => {
              const isSaved = savedIds.has(recipe.id);
              return (
                <Link 
                  key={recipe.id} 
                  href={`/recipes/${recipe.id}`}
                  className="glass-card" 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    overflow: "hidden", 
                    height: "100%",
                    cursor: "pointer",
                    textDecoration: "none"
                  }}
                >
                  {/* Card Body */}
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                    {/* Top Tags & Heart Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--primary-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                          {JSON.parse(recipe.cuisines || "[]")[0] || "General"}
                        </span>
                        {JSON.parse(recipe.diets || "[]").slice(0, 1).map((diet: string) => (
                          <span key={diet} className="badge badge-primary" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "10px", padding: "1px 6px" }}>
                            {diet}
                          </span>
                        ))}
                      </div>
                      
                      <button
                        onClick={(e) => handleToggleSave(recipe.id, e)}
                        className="btn btn-icon"
                        style={{
                          background: "rgba(148, 163, 184, 0.05)",
                          borderColor: isSaved ? "var(--primary)" : "var(--border)",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 5
                        }}
                      >
                        <Heart size={14} style={{ color: isSaved ? "var(--primary)" : "var(--text-secondary)", fill: isSaved ? "var(--primary)" : "none" }} />
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.3, color: "var(--text-primary)" }}>{recipe.title}</h3>
                    </div>

                    <p style={{ 
                      fontSize: "13px", 
                      color: "var(--text-secondary)", 
                      display: "-webkit-box", 
                      WebkitLineClamp: 3, 
                      WebkitBoxOrient: "vertical", 
                      overflow: "hidden", 
                      lineHeight: 1.5,
                      margin: 0
                    }}>
                      {recipe.summary?.replace(/<[^>]*>/g, "") || "Nutritious recipe mapped with complete calorie and macro diagnostics."}
                    </p>

                    {/* Prep details */}
                    <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-muted)", marginTop: "auto", paddingTop: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} />
                        <span>{recipe.readyInMinutes}m cook</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Users size={12} />
                        <span>{recipe.servings} serving{recipe.servings > 1 ? "s" : ""}</span>
                      </div>
                    </div>

                    {/* Macros Strip */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(4, 1fr)", 
                      gap: "6px", 
                      background: "rgba(148, 163, 184, 0.04)", 
                      padding: "8px 12px", 
                      borderRadius: "var(--radius-md)", 
                      border: "1px solid var(--border)",
                      textAlign: "center"
                    }}>
                      <div>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Calories</span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{Math.round(recipe.calories)}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Protein</span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--blue)" }}>{Math.round(recipe.protein)}g</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Carbs</span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)" }}>{Math.round(recipe.carbs)}g</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Fat</span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--pink)" }}>{Math.round(recipe.fat)}g</span>
                      </div>
                    </div>

                    {/* Quick Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setLogRecipe(recipe);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ width: "100%", justifyContent: "center", marginTop: "4px", zIndex: 5 }}
                    >
                      <span>Add to Meal Log</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW RECIPE DETAILS MODAL */}
      {selectedRecipe && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="glass-card fade-in"
            style={{
              width: "100%",
              maxWidth: "680px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--primary-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {JSON.parse(selectedRecipe.cuisines || "[]").join(" · ") || "Healthy Kitchen"}
                </span>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>{selectedRecipe.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="btn btn-icon btn-ghost"
                style={{ borderRadius: "50%" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Macro targets row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", background: "var(--bg-elevated)", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", textAlign: "center" }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Calories</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{Math.round(selectedRecipe.calories)} kcal</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Protein</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--blue)" }}>{Math.round(selectedRecipe.protein)}g</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Carbs</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent)" }}>{Math.round(selectedRecipe.carbs)}g</span>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Fat</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--pink)" }}>{Math.round(selectedRecipe.fat)}g</span>
              </div>
            </div>

            {/* Ingredients Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                Required Ingredients
              </h4>
              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                <ul style={{ display: "flex", flexDirection: "column", gap: "8px", listStyleType: "none" }}>
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                      <span>{ing.ingredient?.name ? ing.ingredient.name.charAt(0).toUpperCase() + ing.ingredient.name.slice(1) : ing.original}</span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {ing.amount} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Ingredient specifications not loaded.</p>
              )}
            </div>

            {/* Instructions Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                Preparation Steps
              </h4>
              <p style={{ 
                fontSize: "13px", 
                color: "var(--text-secondary)", 
                lineHeight: 1.6, 
                whiteSpace: "pre-line"
              }}>
                {selectedRecipe.instructions?.replace(/<[^>]*>/g, "") || "No instruction set provided. Heat, plate, and serve."}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
              <button onClick={() => setSelectedRecipe(null)} className="btn btn-secondary">
                Close Details
              </button>
              <button
                onClick={() => {
                  setLogRecipe(selectedRecipe);
                  setSelectedRecipe(null);
                }}
                className="btn btn-primary"
              >
                <span>Add to Log</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOG MEAL DIALOG */}
      {logRecipe && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1010,
          }}
          onClick={() => setLogRecipe(null)}
        >
          <div
            className="glass-card fade-in"
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Log to Daily Journal</h3>
              <button onClick={() => setLogRecipe(null)} className="btn btn-icon btn-ghost" style={{ borderRadius: "50%" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleLogMeal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                Logging: <strong style={{ color: "var(--text-primary)" }}>{logRecipe.title}</strong>
              </div>

              <div className="input-group">
                <label className="input-label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Meal Slot</label>
                <select
                  className="input"
                  value={logMealType}
                  onChange={(e) => setLogMealType(e.target.value)}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Servings Consumed</label>
                <input
                  type="number"
                  className="input"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={logServings}
                  onChange={(e) => setLogServings(Number(e.target.value))}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" onClick={() => setLogRecipe(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isLogging}>
                  {isLogging ? "Logging..." : "Confirm Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
