"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  Clock, 
  Users, 
  Heart, 
  Calendar, 
  Utensils, 
  BookOpen, 
  Plus, 
  Sparkles,
  ChevronRight,
  Flame,
  Dumbbell,
  Apple,
  Sparkle
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface Ingredient {
  ingredient: {
    id: string;
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
  fiber: number;
  sugar: number;
  isCustom: boolean;
  ingredients?: Ingredient[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RecipeDetailPage(props: PageProps) {
  const router = useRouter();
  const { success, error } = useToast();
  
  // Unwrap params using React.use
  const params = React.use(props.params);
  const recipeId = params.id;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  const [logDate, setLogDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [logMealType, setLogMealType] = useState("Breakfast");
  const [logServings, setLogServings] = useState(1);
  const [isLogging, setIsLogging] = useState(false);

  const [planDate, setPlanDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [planMealType, setPlanMealType] = useState("Breakfast");
  const [planServings, setPlanServings] = useState(1);
  const [isPlanning, setIsPlanning] = useState(false);

  // Fetch recipe details
  const fetchRecipeDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}`);
      if (res.ok) {
        const json = await res.json();
        setRecipe(json);
        setLogServings(json.servings || 1);
        setPlanServings(json.servings || 1);
      } else {
        error("Failed to load recipe details.");
      }

      // Check if recipe is in favorites
      const favRes = await fetch("/api/recipes/save");
      if (favRes.ok) {
        const favs: Recipe[] = await favRes.json();
        setIsSaved(favs.some((r) => r.id === recipeId));
      }
    } catch (err) {
      console.error(err);
      error("Error loading recipe details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeDetails();
  }, [recipeId]);

  const handleToggleSave = async () => {
    try {
      const res = await fetch("/api/recipes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.saved) {
          success("Recipe bookmarked!");
          setIsSaved(true);
        } else {
          success("Recipe removed from bookmarks.");
          setIsSaved(false);
        }
      } else {
        error("Failed to update bookmark status.");
      }
    } catch (err) {
      console.error(err);
      error("Error bookmarking recipe.");
    }
  };

  const handleLogMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe) return;
    setIsLogging(true);
    try {
      const scale = logServings / recipe.servings;
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: logDate,
          mealType: logMealType,
          recipeId: recipe.id,
          customName: recipe.title,
          servings: logServings,
          calories: recipe.calories * scale,
          protein: recipe.protein * scale,
          carbs: recipe.carbs * scale,
          fat: recipe.fat * scale,
        }),
      });

      if (res.ok) {
        success(`Logged ${recipe.title} to your journal!`);
        setShowLogModal(false);
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

  const handlePlanMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe) return;
    setIsPlanning(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: planDate,
          mealType: planMealType,
          recipeId: recipe.id,
          servings: planServings,
        }),
      });

      if (res.ok) {
        success(`Scheduled ${recipe.title} on your planner!`);
        setShowPlanModal(false);
      } else {
        error("Failed to plan meal.");
      }
    } catch (err) {
      console.error(err);
      error("Error scheduling meal.");
    } finally {
      setIsPlanning(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", minHeight: "60vh", justifyContent: "center", alignItems: "center" }}>
        <div className="skeleton" style={{ width: "80px", height: "80px", borderRadius: "50%" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading premium recipe details...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="glass-card" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Recipe not found</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>The requested recipe details could not be retrieved from the database.</p>
        <button onClick={() => router.push("/recipes")} className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Vault</span>
        </button>
      </div>
    );
  }

  const cuisinesList = JSON.parse(recipe.cuisines || "[]") as string[];
  const dietsList = JSON.parse(recipe.diets || "[]") as string[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      
      {/* Header / Actions bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <button onClick={() => router.push("/recipes")} className="btn btn-secondary" style={{ gap: "8px" }}>
          <ArrowLeft size={16} />
          <span>Back to Vault</span>
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleToggleSave} className="btn btn-secondary" style={{ gap: "8px" }}>
            <Heart size={16} style={{ color: isSaved ? "var(--primary)" : "var(--text-secondary)", fill: isSaved ? "var(--primary)" : "none" }} />
            <span>{isSaved ? "Saved" : "Save to Favorites"}</span>
          </button>
          <button onClick={() => setShowLogModal(true)} className="btn btn-secondary" style={{ gap: "8px" }}>
            <Utensils size={16} />
            <span>Add to Log</span>
          </button>
          <button onClick={() => setShowPlanModal(true)} className="btn btn-primary" style={{ gap: "8px" }}>
            <Calendar size={16} />
            <span>Add to Planner</span>
          </button>
        </div>
      </div>

      {/* Main Glass Layout Banner */}
      <div className="glass-card" style={{ padding: "0px", overflow: "hidden", position: "relative" }}>
        {/* CSS to handle responsive grid side-by-side on desktop */}
        <style dangerouslySetInnerHTML={{__html: `
          .banner-grid {
            display: flex;
            flex-direction: column;
          }
          @media (min-width: 768px) {
            .banner-grid {
              display: grid !important;
              grid-template-columns: 1.2fr 1fr !important;
            }
          }
        `}} />
        
        <div className="banner-grid">
          {/* Banner Photo */}
          <div style={{ 
            height: "360px",
            background: recipe.image ? `url(${recipe.image}) center/cover no-repeat` : "linear-gradient(135deg, var(--bg-elevated), var(--primary-glow))",
            borderRight: "1px solid var(--border)",
            position: "relative"
          }}>
            <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {dietsList.map((diet) => (
                <span key={diet} className="badge badge-primary" style={{ background: "rgba(16, 185, 129, 0.9)", color: "#030712", fontWeight: 700 }}>
                  {diet}
                </span>
              ))}
            </div>
          </div>

          {/* Banner Info */}
          <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={16} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "12px", color: "var(--primary-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {cuisinesList.join(" · ") || "Chef's Healthy Recommendation"}
                </span>
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>{recipe.title}</h2>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }} 
               dangerouslySetInnerHTML={{ __html: recipe.summary || "This premium healthy recipe is packed with balanced macros and essential trace nutrients to support your metabolic recovery goals." }} />

            {/* Quick stats strip */}
            <div style={{ display: "flex", gap: "24px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "16px 0", fontSize: "14px", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={18} style={{ color: "var(--text-muted)" }} />
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Ready Time</span>
                  <strong>{recipe.readyInMinutes} Mins</strong>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} style={{ color: "var(--text-muted)" }} />
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Serving Size</span>
                  <strong>{recipe.servings} Serving{recipe.servings > 1 ? "s" : ""}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Macros Dashboard & Nutrition Facts */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkle size={18} style={{ color: "var(--primary)" }} />
          <span>Macro Diagnostics</span>
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
          {/* Calorie Card */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderTop: "3px solid var(--primary)" }}>
            <Flame size={24} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Calories</span>
            <span style={{ fontSize: "20px", fontWeight: 800 }}>{Math.round(recipe.calories)} kcal</span>
          </div>

          {/* Protein Card */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderTop: "3px solid var(--blue)" }}>
            <Dumbbell size={24} style={{ color: "var(--blue)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Proteins</span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--blue)" }}>{Math.round(recipe.protein)}g</span>
          </div>

          {/* Carbs Card */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderTop: "3px solid var(--accent)" }}>
            <Apple size={24} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Carbohydrates</span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent)" }}>{Math.round(recipe.carbs)}g</span>
          </div>

          {/* Fat Card */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderTop: "3px solid var(--pink)" }}>
            <Utensils size={24} style={{ color: "var(--pink)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Fats</span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--pink)" }}>{Math.round(recipe.fat)}g</span>
          </div>

          {/* Fiber Card */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderTop: "3px solid #10b981" }}>
            <BookOpen size={24} style={{ color: "#10b981" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Dietary Fiber</span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#10b981" }}>{Math.round(recipe.fiber)}g</span>
          </div>

          {/* Sugar Card */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderTop: "3px solid #8b5cf6" }}>
            <Sparkle size={24} style={{ color: "#8b5cf6" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Net Sugars</span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#8b5cf6" }}>{Math.round(recipe.sugar)}g</span>
          </div>
        </div>
      </div>

      {/* Recipe Core Content: Ingredients & Instructions split */}
      <div className="content-grid" style={{ gap: "24px" }}>
        <style dangerouslySetInnerHTML={{__html: `
          .content-grid {
            display: flex;
            flex-direction: column;
          }
          @media (min-width: 768px) {
            .content-grid {
              display: grid !important;
              grid-template-columns: 1fr 1.5fr !important;
            }
          }
        `}} />
          
        {/* Ingredients checklist card */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Utensils size={18} style={{ color: "var(--primary)" }} />
            <span>Required Ingredients</span>
          </h3>
          
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Organize ingredients by Aisle */}
              {Array.from(new Set(recipe.ingredients.map(i => i.ingredient?.aisle || "Pantry"))).map((aisle) => (
                <div key={aisle} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {aisle}
                  </span>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "6px", listStyleType: "none", padding: 0 }}>
                    {recipe.ingredients?.filter(i => (i.ingredient?.aisle || "Pantry") === aisle).map((ing, idx) => (
                      <li key={idx} style={{ 
                        fontSize: "13px", 
                        color: "var(--text-secondary)", 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        padding: "6px 8px",
                        background: "rgba(148, 163, 184, 0.02)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid rgba(255,255,255,0.02)"
                      }}>
                        <span>{ing.ingredient?.name ? ing.ingredient.name.charAt(0).toUpperCase() + ing.ingredient.name.slice(1) : ing.original}</span>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {ing.amount} {ing.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Ingredient specifications not loaded.</p>
          )}
        </div>

        {/* Instructions Step-by-Step */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={18} style={{ color: "var(--primary)" }} />
            <span>Step-by-Step Recipe Guide</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {recipe.instructions ? (
              recipe.instructions.split(/\n|(?=\d+\.)/).filter(line => line.trim()).map((step, idx) => {
                const cleanStep = step.replace(/^\d+\.\s*/, "").trim();
                return (
                  <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{ 
                      background: "rgba(16, 185, 129, 0.15)", 
                      color: "var(--primary)", 
                      width: "26px", 
                      height: "26px", 
                      borderRadius: "50%", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      fontSize: "12px", 
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, paddingTop: "2px" }}>
                      {cleanStep}
                    </p>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No cooking step sequences defined. Simply assemble and plate.</p>
            )}
          </div>
        </div>

      </div>

      {/* LOG MEAL DIALOG OVERLAY */}
      {showLogModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.86)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="glass-card fade-in"
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "32px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <Utensils size={18} style={{ color: "var(--primary)" }} />
                <span>Log to Meal Journal</span>
              </h3>
            </div>

            <form onSubmit={handleLogMeal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                Selected Item: <strong style={{ color: "var(--text-primary)" }}>{recipe.title}</strong>
              </div>

              <div className="input-group">
                <label className="input-label">Date of Intake</label>
                <input
                  type="date"
                  className="input"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Meal Category Slot</label>
                <select
                  className="input"
                  value={logMealType}
                  onChange={(e) => setLogMealType(e.target.value)}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Servings Eaten</label>
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
                <button type="button" onClick={() => setShowLogModal(false)} className="btn btn-secondary btn-sm">
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

      {/* PLAN MEAL DIALOG OVERLAY */}
      {showPlanModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.86)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowPlanModal(false)}
        >
          <div
            className="glass-card fade-in"
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "32px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={18} style={{ color: "var(--primary)" }} />
                <span>Schedule on Meal Planner</span>
              </h3>
            </div>

            <form onSubmit={handlePlanMeal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                Selected Item: <strong style={{ color: "var(--text-primary)" }}>{recipe.title}</strong>
              </div>

              <div className="input-group">
                <label className="input-label">Date to Plan</label>
                <input
                  type="date"
                  className="input"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Meal Slot</label>
                <select
                  className="input"
                  value={planMealType}
                  onChange={(e) => setPlanMealType(e.target.value)}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Servings Planned</label>
                <input
                  type="number"
                  className="input"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={planServings}
                  onChange={(e) => setPlanServings(Number(e.target.value))}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowPlanModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isPlanning}>
                  {isPlanning ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
