"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Trash2, 
  Plus, 
  CalendarClock, 
  Check, 
  X,
  RefreshCw,
  Search,
  Bot
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface Recipe {
  id: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface PlannedMeal {
  id: string;
  date: string;
  mealType: string;
  recipeId: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recipe: Recipe;
}

export default function PlannerPage() {
  const { success, error } = useToast();

  // Week start state (defaults to Monday of current week)
  const [mondayDate, setMondayDate] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const mon = new Date(today.setDate(diff));
    return mon;
  });

  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAutopilotRunning, setIsAutopilotRunning] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ date: string; mealType: string } | null>(null);
  
  // Recipe Search
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Generate 7 dates starting from the current Monday
  const weekDates = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + idx);
    const dateStr = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
    return { dateStr, label };
  });

  const startDateStr = weekDates[0].dateStr;
  const endDateStr = weekDates[6].dateStr;

  const fetchPlannerData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Goals
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setCalorieTarget(settings.goals.calorieTarget);
      }

      // 2. Fetch Planned Meals
      const plannerRes = await fetch(`/api/planner?startDate=${startDateStr}&endDate=${endDateStr}`);
      if (plannerRes.ok) {
        const json = await plannerRes.json();
        setPlannedMeals(json);
      }

      // 3. Fetch Recipes for search selector
      const recipesRes = await fetch("/api/recipes?limit=50");
      if (recipesRes.ok) {
        const json = await recipesRes.json();
        setRecipes(json.recipes || []);
      }
    } catch (err) {
      console.error(err);
      error("Failed to load planner calendar.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, [mondayDate]);

  const shiftWeek = (weeks: number) => {
    const nextMon = new Date(mondayDate);
    nextMon.setDate(mondayDate.getDate() + weeks * 7);
    setMondayDate(nextMon);
  };

  // Plan a recipe in a cell
  const handlePlanRecipe = async (recipe: Recipe) => {
    if (!selectedCell) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedCell.date,
          mealType: selectedCell.mealType,
          recipeId: recipe.id,
          servings: 1,
        }),
      });

      if (res.ok) {
        success(`Planned ${recipe.title} for ${selectedCell.mealType}!`);
        setShowAddModal(false);
        setSearchQuery("");
        fetchPlannerData();
      } else {
        error("Failed to plan meal.");
      }
    } catch (err) {
      console.error(err);
      error("Error planning meal.");
    } finally {
      setIsAdding(false);
    }
  };

  // Delete a planned meal
  const handleDeletePlanned = async (plannedId: string) => {
    try {
      const res = await fetch(`/api/planner?id=${plannedId}`, { method: "DELETE" });
      if (res.ok) {
        success("Planned meal removed.");
        fetchPlannerData();
      } else {
        error("Failed to delete planned meal.");
      }
    } catch (err) {
      console.error(err);
      error("Error deleting planned meal.");
    }
  };

  // AI Autopilot Trigger
  const handleTriggerAutopilot = async () => {
    setIsAutopilotRunning(true);
    try {
      const res = await fetch("/api/planner/autopilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: startDateStr, endDate: endDateStr }),
      });

      if (res.ok) {
        const json = await res.json();
        success(`Autopilot filled ${json.count} meals for the week!`);
        fetchPlannerData();
      } else {
        const json = await res.json();
        error(json.error || "Failed to trigger Autopilot.");
      }
    } catch (err) {
      console.error(err);
      error("Error generating weekly autopilot schedule.");
    } finally {
      setIsAutopilotRunning(false);
    }
  };

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mealSlots = ["Breakfast", "Lunch", "Dinner"];

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
        
        {/* Header controls panel */}
        <div className="glass-card" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <CalendarClock size={20} style={{ color: "var(--primary)" }} />
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Weekly Diet Planner</h2>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Week: {new Date(startDateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(endDateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Shift week navigator */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => shiftWeek(-1)} className="btn btn-secondary btn-icon" style={{ borderRadius: "50%" }}>
              <ChevronLeft size={16} />
            </button>
            
            <button 
              onClick={() => {
                const today = new Date();
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                setMondayDate(new Date(today.setDate(diff)));
              }}
              className="btn btn-secondary btn-sm"
            >
              Current Week
            </button>

            <button onClick={() => shiftWeek(1)} className="btn btn-secondary btn-icon" style={{ borderRadius: "50%" }}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Autopilot Button */}
          <button
            onClick={handleTriggerAutopilot}
            className="btn btn-primary"
            style={{ gap: "8px" }}
            disabled={isAutopilotRunning}
          >
            {isAutopilotRunning ? (
              <>
                <RefreshCw size={16} className="spinning" />
                <span>Autopilot Generating...</span>
              </>
            ) : (
              <>
                <Bot size={16} />
                <span>Run AI Autopilot</span>
              </>
            )}
          </button>
        </div>

        {/* Autopilot Loader Backdrop */}
        {isAutopilotRunning && (
          <div style={{ background: "rgba(10, 15, 26, 0.4)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "16px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "12px" }} className="pulse-glow">
            <Sparkles size={16} style={{ color: "var(--primary)" }} className="spinning" />
            <span style={{ fontSize: "13px", fontWeight: 600 }}>
              Smart recommending algorithm is searching seeded recipes to balance macro percentages and excludings...
            </span>
          </div>
        )}

        {/* 7x4 Weekly Grid layout */}
        {isLoading ? (
          <div className="skeleton" style={{ height: "450px" }} />
        ) : (
          <div 
            className="glass-card" 
            style={{ 
              overflowX: "auto", 
              padding: "20px", 
              border: "1px solid var(--glass-border)",
              background: "var(--glass)"
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr>
                  <th style={{ width: "100px", padding: "12px", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Slot</th>
                  {weekDates.map((day) => (
                    <th 
                      key={day.dateStr}
                      style={{ 
                        padding: "12px", 
                        borderBottom: "1px solid var(--border)", 
                        textAlign: "center",
                        width: "calc((100% - 100px) / 7)"
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: 700, display: "block" }}>{day.label.split(",")[0]}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{day.label.split(",")[1]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mealSlots.map((slot) => (
                  <tr key={slot} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "16px 12px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                      {slot}
                    </td>
                    {weekDates.map((day) => {
                      // Find planned meal for this slot & date
                      const planned = plannedMeals.find(
                        (p) => p.date === day.dateStr && p.mealType.toLowerCase() === slot.toLowerCase()
                      );

                      return (
                        <td key={day.dateStr} style={{ padding: "10px", verticalAlign: "top", height: "100px" }}>
                          {planned ? (
                            <div 
                              style={{ 
                                background: "var(--bg-elevated)", 
                                border: "1px solid var(--border)", 
                                borderRadius: "var(--radius-md)", 
                                padding: "8px 10px", 
                                display: "flex", 
                                flexDirection: "column",
                                justifyContent: "space-between",
                                height: "100%",
                                gap: "6px"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                  {planned.recipe?.title}
                                </span>
                                <button
                                  onClick={() => handleDeletePlanned(planned.id)}
                                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
                                >
                                  <Trash2 size={11} hover-color="var(--danger)" />
                                </button>
                              </div>
                              <span style={{ fontSize: "10px", color: "var(--primary-light)", fontWeight: 600 }}>
                                {Math.round(planned.calories)} kcal
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedCell({ date: day.dateStr, mealType: slot });
                                setShowAddModal(true);
                              }}
                              style={{
                                width: "100%",
                                height: "100%",
                                background: "rgba(148, 163, 184, 0.02)",
                                border: "1px dashed var(--border)",
                                borderRadius: "var(--radius-md)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                color: "var(--text-muted)",
                                fontSize: "12px",
                                transition: "all var(--transition)"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = "var(--primary)";
                                e.currentTarget.style.color = "var(--primary-light)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = "var(--border)";
                                e.currentTarget.style.color = "var(--text-muted)";
                              }}
                            >
                              <Plus size={12} />
                              <span>Plan</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                {/* Daily Target Adherence Summary Row */}
                <tr>
                  <td style={{ padding: "16px 12px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Daily Total
                  </td>
                  {weekDates.map((day) => {
                    const dayMeals = plannedMeals.filter((p) => p.date === day.dateStr);
                    const totalCals = dayMeals.reduce((sum, p) => sum + p.calories, 0);
                    const isAdherent = totalCals > 0 && Math.abs(totalCals - calorieTarget) <= 200;
                    const isOver = totalCals > calorieTarget + 200;

                    return (
                      <td key={day.dateStr} style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: totalCals > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                          {Math.round(totalCals)} kcal
                        </span>
                        {totalCals > 0 && (
                          <div style={{ marginTop: "4px" }}>
                            {isAdherent ? (
                              <span className="badge badge-success">Target Hit</span>
                            ) : isOver ? (
                              <span className="badge badge-danger">Surplus</span>
                            ) : (
                              <span className="badge badge-warning">Deficit</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECIPE SELECT DIALOG */}
      {showAddModal && selectedCell && (
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
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="glass-card fade-in"
            style={{
              width: "100%",
              maxWidth: "460px",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Schedule planned meal</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-icon btn-ghost" style={{ borderRadius: "50%" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Planning: <strong>{selectedCell.mealType}</strong> on <strong>{selectedCell.date}</strong>
            </div>

            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search recipe catalog..."
                className="input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "36px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
              {filteredRecipes.length === 0 ? (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "16px" }}>
                  No recipes found. Seed catalog first.
                </p>
              ) : (
                filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "rgba(148, 163, 184, 0.01)"
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "13px" }}>{recipe.title}</strong>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>{Math.round(recipe.calories)} kcal</span>
                    </div>
                    <button
                      onClick={() => handlePlanRecipe(recipe)}
                      className="btn btn-primary btn-sm"
                      disabled={isAdding}
                    >
                      Schedule
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
