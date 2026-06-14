"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Check, RefreshCw, ChefHat } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

interface IngredientInput {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function CreateRecipePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Core Form Fields
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [instructions, setInstructions] = useState("");
  const [servings, setServings] = useState(4);
  const [readyInMinutes, setReadyInMinutes] = useState(30);

  // Ingredients builder
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: "", amount: 100, unit: "g", calories: 0, protein: 0, carbs: 0, fat: 0 },
  ]);

  const handleAddIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { name: "", amount: 100, unit: "g", calories: 0, protein: 0, carbs: 0, fat: 0 },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length === 1) {
      error("A recipe must have at least one ingredient.");
      return;
    }
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleIngredientChange = (index: number, key: keyof IngredientInput, value: string | number) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [key]: value,
      };
      return next;
    });
  };

  // Calculation aggregates
  const totalCalories = ingredients.reduce((sum, ing) => sum + (Number(ing.calories) || 0), 0);
  const totalProtein = ingredients.reduce((sum, ing) => sum + (Number(ing.protein) || 0), 0);
  const totalCarbs = ingredients.reduce((sum, ing) => sum + (Number(ing.carbs) || 0), 0);
  const totalFat = ingredients.reduce((sum, ing) => sum + (Number(ing.fat) || 0), 0);

  const perServingCalories = servings > 0 ? totalCalories / servings : 0;
  const perServingProtein = servings > 0 ? totalProtein / servings : 0;
  const perServingCarbs = servings > 0 ? totalCarbs / servings : 0;
  const perServingFat = servings > 0 ? totalFat / servings : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error("Please enter a recipe title.");
      return;
    }
    if (!summary.trim()) {
      error("Please enter a recipe description.");
      return;
    }
    if (!instructions.trim()) {
      error("Please enter step-by-step instructions.");
      return;
    }
    const emptyIng = ingredients.some((ing) => !ing.name.trim());
    if (emptyIng) {
      error("All ingredients must have a name.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/recipes/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          instructions: instructions.trim(),
          servings: Number(servings),
          readyInMinutes: Number(readyInMinutes),
          ingredients: ingredients.map((ing) => ({
            name: ing.name.trim(),
            amount: Number(ing.amount),
            unit: ing.unit,
            calories: Number(ing.calories),
            protein: Number(ing.protein),
            carbs: Number(ing.carbs),
            fat: Number(ing.fat),
          })),
        }),
      });

      if (res.ok) {
        success("Custom recipe created and saved!");
        router.push("/recipes");
      } else {
        const data = await res.json();
        error(data.error || "Failed to save recipe.");
      }
    } catch (err) {
      console.error(err);
      error("An error occurred while creating custom recipe.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      {/* Navigation and Title Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/recipes" className="btn btn-secondary btn-icon" style={{ borderRadius: "50%" }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>Create Custom Recipe</h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Construct a personalized recipe by adding custom ingredients and automatically auditing nutrients.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px" }}>
        {/* Left Side: General Info & Ingredients */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* General Metadata */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <ChefHat size={16} style={{ color: "var(--primary)" }} />
              <span>General Details</span>
            </h3>

            <div className="input-group">
              <label className="input-label">Recipe Title</label>
              <input
                type="text"
                placeholder="e.g. My Morning Super Smoothie"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Detailed Description / Summary</label>
              <textarea
                placeholder="Write a highly detailed description about the recipe, its flavor profile, and nutritional benefits..."
                className="input"
                style={{ minHeight: "100px", padding: "12px", resize: "vertical", fontFamily: "inherit" }}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Step-by-Step Instructions</label>
              <textarea
                placeholder="Provide detailed, step-by-step instructions. Put each step on a new line (e.g.,\n1. Preheat oven to 400°F...\n2. Slice the avocados...)"
                className="input"
                style={{ minHeight: "150px", padding: "12px", resize: "vertical", fontFamily: "inherit" }}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Servings</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input"
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Total Prep & Cook Time (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  className="input"
                  value={readyInMinutes}
                  onChange={(e) => setReadyInMinutes(Math.max(1, Number(e.target.value)))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Ingredients Builder */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Recipe Ingredients</h3>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="btn btn-secondary btn-sm"
                style={{ gap: "4px" }}
              >
                <Plus size={14} />
                <span>Add Ingredient</span>
              </button>
            </div>

            {/* Ingredients Inputs Block */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {ingredients.map((ing, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: "flex", 
                    gap: "10px", 
                    alignItems: "flex-end", 
                    background: "rgba(148, 163, 184, 0.02)", 
                    padding: "12px", 
                    borderRadius: "var(--radius-md)", 
                    border: "1px solid var(--border)",
                    flexWrap: "wrap"
                  }}
                >
                  {/* Name */}
                  <div style={{ flex: "2 1 180px" }} className="input-group">
                    <label className="input-label">Ingredient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Oatmeal"
                      className="input"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(idx, "name", e.target.value)}
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div style={{ flex: "1 1 80px" }} className="input-group">
                    <label className="input-label">Amount</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      className="input"
                      value={ing.amount}
                      onChange={(e) => handleIngredientChange(idx, "amount", Number(e.target.value))}
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div style={{ flex: "1 1 80px" }} className="input-group">
                    <label className="input-label">Unit</label>
                    <input
                      type="text"
                      placeholder="g, cup, tbsp"
                      className="input"
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(idx, "unit", e.target.value)}
                      required
                    />
                  </div>

                  {/* Calories */}
                  <div style={{ flex: "1 1 80px" }} className="input-group">
                    <label className="input-label">Calories</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={ing.calories}
                      onChange={(e) => handleIngredientChange(idx, "calories", Number(e.target.value))}
                    />
                  </div>

                  {/* Protein */}
                  <div style={{ flex: "1 1 80px" }} className="input-group">
                    <label className="input-label">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={ing.protein}
                      onChange={(e) => handleIngredientChange(idx, "protein", Number(e.target.value))}
                    />
                  </div>

                  {/* Carbs */}
                  <div style={{ flex: "1 1 80px" }} className="input-group">
                    <label className="input-label">Carbs (g)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={ing.carbs}
                      onChange={(e) => handleIngredientChange(idx, "carbs", Number(e.target.value))}
                    />
                  </div>

                  {/* Fat */}
                  <div style={{ flex: "1 1 80px" }} className="input-group">
                    <label className="input-label">Fat (g)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={ing.fat}
                      onChange={(e) => handleIngredientChange(idx, "fat", Number(e.target.value))}
                    />
                  </div>

                  {/* Delete Row button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="btn btn-danger btn-icon"
                    style={{ height: "38px" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddIngredient}
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Plus size={16} />
              <span>Add Another Ingredient</span>
            </button>
          </div>
        </div>

        {/* Right Side: Macro Live Preview & Submit */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Nutrient Audit Preview */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Recipe Nutrition Audit</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total Recipe Calories:</span>
                <strong style={{ color: "var(--text-primary)" }}>{Math.round(totalCalories)} kcal</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total Recipe Protein:</span>
                <strong style={{ color: "var(--blue)" }}>{Math.round(totalProtein)}g</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total Recipe Carbs:</span>
                <strong style={{ color: "var(--accent)" }}>{Math.round(totalCarbs)}g</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total Recipe Fat:</span>
                <strong style={{ color: "var(--pink)" }}>{Math.round(totalFat)}g</strong>
              </div>
            </div>

            {/* Split per serving */}
            <div style={{ background: "var(--bg-elevated)", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Estimated Nutrients Per Serving
              </span>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Calories</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{Math.round(perServingCalories)}</span>
                </div>
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Protein</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--blue)" }}>{Math.round(perServingProtein)}g</span>
                </div>
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Carbs</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent)" }}>{Math.round(perServingCarbs)}g</span>
                </div>
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Fat</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--pink)" }}>{Math.round(perServingFat)}g</span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw size={16} className="spinning" />
              ) : (
                <>
                  <Check size={16} />
                  <span>Build & Save Recipe</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
