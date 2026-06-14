"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Mic, 
  MicOff, 
  Camera, 
  Sparkles, 
  Trash2, 
  Plus, 
  FolderHeart, 
  Flame, 
  Grid3X3, 
  Timer,
  Check,
  X,
  Upload,
  RefreshCw
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

interface MealEntry {
  id: string;
  customName: string | null;
  recipe?: Recipe | null;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealGroup {
  id: string;
  mealType: string;
  entries: MealEntry[];
}

interface Template {
  id: string;
  name: string;
  label: string;
}

export default function MealLogPage() {
  const { success, error } = useToast();
  
  // Date State (Defaults to Today in local timezone)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("en-CA");
  });

  // Data States
  const [mealGroups, setMealGroups] = useState<MealGroup[]>([]);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinTarget, setProteinTarget] = useState(150);
  const [carbTarget, setCarbTarget] = useState(250);
  const [fatTarget, setFatTarget] = useState(65);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Modal Controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetMealSlot, setTargetMealSlot] = useState("Breakfast");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  // ONE-OFF CUSTOM LOG FORM STATE
  const [activeAddTab, setActiveAddTab] = useState<"search" | "custom">("search");
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [customFoodName, setCustomFoodName] = useState("");
  const [customCalories, setCustomCalories] = useState(200);
  const [customProtein, setCustomProtein] = useState(15);
  const [customCarbs, setCustomCarbs] = useState(20);
  const [customFat, setCustomFat] = useState(5);
  const [customServings, setCustomServings] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // VOICE LOGGING STATES
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceExtractedFood, setVoiceExtractedFood] = useState<any>(null);
  const [isVoiceExtracting, setIsVoiceExtracting] = useState(false);
  const recognitionRef = useRef<any>(null);

  // PHOTO VISION SCANNER STATES
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanImageBase64, setScanImageBase64] = useState<string>("");

  // CALCULATE DAILY LOGGED TOTALS
  let loggedCalories = 0;
  let loggedProtein = 0;
  let loggedCarbs = 0;
  let loggedFat = 0;

  mealGroups.forEach((group) => {
    group.entries.forEach((entry) => {
      loggedCalories += entry.calories * entry.servings;
      loggedProtein += entry.protein * entry.servings;
      loggedCarbs += entry.carbs * entry.servings;
      loggedFat += entry.fat * entry.servings;
    });
  });

  const percentCalories = Math.min(100, Math.round((loggedCalories / calorieTarget) * 100)) || 0;
  const percentProtein = Math.min(100, Math.round((loggedProtein / proteinTarget) * 100)) || 0;
  const percentCarbs = Math.min(100, Math.round((loggedCarbs / carbTarget) * 100)) || 0;
  const percentFat = Math.min(100, Math.round((loggedFat / fatTarget) * 100)) || 0;

  // FETCH ALL DATA FOR DATE
  const fetchDayData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Goals
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setCalorieTarget(settings.goals.calorieTarget);
        setProteinTarget(settings.goals.proteinTarget);
        setCarbTarget(settings.goals.carbTarget);
        setFatTarget(settings.goals.fatTarget);
      }

      // 2. Fetch Meals
      const mealsRes = await fetch(`/api/meals?date=${selectedDate}`);
      if (mealsRes.ok) {
        const meals = await mealsRes.json();
        setMealGroups(meals);
      }

      // 3. Fetch Templates
      const templatesRes = await fetch("/api/templates");
      if (templatesRes.ok) {
        const templs = await templatesRes.json();
        setTemplates(templs);
      }

      // 4. Fetch Recipes (for search lookup)
      const recipesRes = await fetch("/api/recipes?limit=50");
      if (recipesRes.ok) {
        const data = await recipesRes.json();
        setRecipes(data.recipes || []);
      }
    } catch (err) {
      console.error(err);
      error("Failed to load journal logs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDayData();
  }, [selectedDate]);

  // DATE HANDLERS
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toLocaleDateString("en-CA"));
  };

  // LOG ENTRY SUBMIT
  const handleLogCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealType: targetMealSlot,
          customName: customFoodName,
          servings: customServings,
          calories: customCalories,
          protein: customProtein,
          carbs: customCarbs,
          fat: customFat,
        }),
      });

      if (res.ok) {
        success(`Logged ${customFoodName} to ${targetMealSlot}!`);
        setShowAddModal(false);
        setCustomFoodName("");
        fetchDayData();
      } else {
        error("Failed to log entry.");
      }
    } catch (err) {
      console.error(err);
      error("Error logging food.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogRecipe = async (recipe: Recipe) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealType: targetMealSlot,
          recipeId: recipe.id,
          customName: recipe.title,
          servings: 1,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
        }),
      });

      if (res.ok) {
        success(`Logged ${recipe.title} to ${targetMealSlot}!`);
        setShowAddModal(false);
        setRecipeSearchQuery("");
        fetchDayData();
      } else {
        error("Failed to log recipe.");
      }
    } catch (err) {
      console.error(err);
      error("Error logging recipe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE ENTRY
  const handleDeleteEntry = async (entryId: string) => {
    try {
      const res = await fetch(`/api/meals?entryId=${entryId}`, { method: "DELETE" });
      if (res.ok) {
        success("Meal entry removed.");
        fetchDayData();
      } else {
        error("Failed to delete entry.");
      }
    } catch (err) {
      console.error(err);
      error("Error deleting entry.");
    }
  };

  // TEMPLATES: APPLY
  const handleApplyTemplate = async (templateId: string) => {
    try {
      const res = await fetch("/api/templates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, date: selectedDate }),
      });
      if (res.ok) {
        success("Template applied to this date!");
        setShowTemplateModal(false);
        fetchDayData();
      } else {
        error("Failed to apply template.");
      }
    } catch (err) {
      console.error(err);
      error("Error applying template.");
    }
  };

  // TEMPLATES: CREATE TEMPLATE FROM CURRENT DAY
  const handleSaveAsTemplate = async () => {
    const templateName = prompt("Enter a name for this day's template (e.g. Workday Routine, Keto High-Protein):");
    if (!templateName) return;

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName, date: selectedDate }),
      });
      if (res.ok) {
        success(`Successfully saved ${templateName} template!`);
        fetchDayData();
      } else {
        error("Failed to create template.");
      }
    } catch (err) {
      console.error(err);
      error("Error saving day template.");
    }
  };

  // VOICE LOGGING: INIT & START/STOP SPEECH
  const startSpeechRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      error("Web Speech API is not supported in this browser. Please use Chrome/Safari.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setVoiceTranscript("");
    };

    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setVoiceTranscript(text);
      handleExtractVoiceDetails(text);
    };

    rec.onerror = (e: any) => {
      console.error(e);
      error("Voice capture encountered an error.");
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopSpeechRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleExtractVoiceDetails = async (transcriptText: string) => {
    setIsVoiceExtracting(true);
    try {
      const res = await fetch("/api/meals/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptText }),
      });
      if (res.ok) {
        const data = await res.json();
        setVoiceExtractedFood(data);
      } else {
        error("Failed to extract food details from voice.");
      }
    } catch (err) {
      console.error(err);
      error("Error analyzing voice data.");
    } finally {
      setIsVoiceExtracting(false);
    }
  };

  const handleSaveVoiceLog = async () => {
    if (!voiceExtractedFood) return;
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealType: targetMealSlot,
          customName: voiceExtractedFood.name,
          servings: 1,
          calories: voiceExtractedFood.calories,
          protein: voiceExtractedFood.protein,
          carbs: voiceExtractedFood.carbs,
          fat: voiceExtractedFood.fat,
        }),
      });

      if (res.ok) {
        success(`Successfully logged ${voiceExtractedFood.name} from voice transcript!`);
        setShowVoiceModal(false);
        setVoiceExtractedFood(null);
        setVoiceTranscript("");
        fetchDayData();
      } else {
        error("Failed to log voice food.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CLAUDE VISION IMAGE SCANNER IMPLEMENTATION
  const handleScanMockImage = async () => {
    setIsScanning(true);
    setScannedResult(null);
    try {
      // Mock passing an image base64. 
      // The API falls back to Avocado Toast or passes to Claude if key is available.
      const res = await fetch("/api/meals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: "mock_image_base64_data", mimeType: "image/jpeg" }),
      });
      if (res.ok) {
        const json = await res.json();
        setScannedResult(json);
      } else {
        error("Failed to analyze meal image.");
      }
    } catch (err) {
      console.error(err);
      error("Error scanning meal image.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveScanResult = async () => {
    if (!scannedResult) return;
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealType: targetMealSlot,
          customName: scannedResult.name,
          servings: 1,
          calories: scannedResult.calories,
          protein: scannedResult.protein,
          carbs: scannedResult.carbs,
          fat: scannedResult.fat,
          fiber: scannedResult.fiber,
        }),
      });

      if (res.ok) {
        success(`Successfully logged ${scannedResult.name} to ${targetMealSlot}!`);
        setShowScanModal(false);
        setScannedResult(null);
        fetchDayData();
      } else {
        error("Failed to save scanned meal.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Lookup filtered recipes based on search
  const filteredRecipes = recipes.filter((r) => 
    r.title.toLowerCase().includes(recipeSearchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      
      {/* Date Selector Header */}
      <div className="glass-card" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Calendar size={20} style={{ color: "var(--primary)" }} />
          <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Daily Nutrition Journal</h2>
        </div>

        {/* Date Selector Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => shiftDate(-1)} className="btn btn-secondary btn-icon" style={{ borderRadius: "50%" }}>
            <ChevronLeft size={16} />
          </button>
          
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: "160px", textAlign: "center", padding: "6px 12px" }}
          />

          <button onClick={() => shiftDate(1)} className="btn btn-secondary btn-icon" style={{ borderRadius: "50%" }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Action controls */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => setShowTemplateModal(true)} 
            className="btn btn-secondary btn-sm"
            style={{ gap: "6px" }}
          >
            <FolderHeart size={14} />
            <span>Apply Template</span>
          </button>
          <button 
            onClick={handleSaveAsTemplate} 
            className="btn btn-secondary btn-sm"
            style={{ gap: "6px" }}
          >
            <Plus size={14} />
            <span>Save Day as Template</span>
          </button>
        </div>
      </div>

      {/* Daily Target Progress Strip */}
      <div className="grid-4">
        {/* Calorie Card */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>Daily Calories</span>
            <Flame size={16} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              {Math.round(loggedCalories)} <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>/ {calorieTarget} kcal</span>
            </h3>
          </div>
          <div style={{ width: "100%", height: "6px", background: "rgba(148, 163, 184, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${percentCalories}%`, height: "100%", background: "var(--primary)", transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{percentCalories}% of target achieved</span>
        </div>

        {/* Protein Card */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>Protein</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--blue)" }}>Target: {proteinTarget}g</span>
          </div>
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              {Math.round(loggedProtein)}g
            </h3>
          </div>
          <div style={{ width: "100%", height: "6px", background: "rgba(148, 163, 184, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${percentProtein}%`, height: "100%", background: "var(--blue)", transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{percentProtein}% completed</span>
        </div>

        {/* Carbs Card */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>Carbohydrates</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)" }}>Target: {carbTarget}g</span>
          </div>
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              {Math.round(loggedCarbs)}g
            </h3>
          </div>
          <div style={{ width: "100%", height: "6px", background: "rgba(148, 163, 184, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${percentCarbs}%`, height: "100%", background: "var(--accent)", transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{percentCarbs}% completed</span>
        </div>

        {/* Fat Card */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>Fats</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--pink)" }}>Target: {fatTarget}g</span>
          </div>
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              {Math.round(loggedFat)}g
            </h3>
          </div>
          <div style={{ width: "100%", height: "6px", background: "rgba(148, 163, 184, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${percentFat}%`, height: "100%", background: "var(--pink)", transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{percentFat}% completed</span>
        </div>
      </div>

      {/* Loader */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: "120px" }} />
          ))}
        </div>
      ) : (
        /* MEAL SLOTS LIST */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {["Breakfast", "Lunch", "Dinner", "Snack"].map((slot) => {
            // Find entries matching slot
            const group = mealGroups.find(
              (g) => g.mealType.toLowerCase() === slot.toLowerCase()
            );
            const entries = group ? group.entries : [];
            const slotCalories = entries.reduce((sum, entry) => sum + entry.calories * entry.servings, 0);

            return (
              <div key={slot} className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Slot Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{slot}</h3>
                    <span className="badge badge-primary">{Math.round(slotCalories)} kcal</span>
                  </div>

                  {/* Add action row */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        setTargetMealSlot(slot);
                        setShowVoiceModal(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: "4px" }}
                    >
                      <Mic size={13} />
                      <span>Voice Log</span>
                    </button>
                    <button
                      onClick={() => {
                        setTargetMealSlot(slot);
                        setShowScanModal(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: "4px" }}
                    >
                      <Camera size={13} />
                      <span>Photo Scan</span>
                    </button>
                    <button
                      onClick={() => {
                        setTargetMealSlot(slot);
                        setShowAddModal(true);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ gap: "4px" }}
                    >
                      <Plus size={13} />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Logged Entries inside Slot */}
                {entries.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>
                    No food logged in this slot yet. Record a meal above.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "rgba(148, 163, 184, 0.02)",
                          padding: "12px 16px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                            {entry.customName || entry.recipe?.title || "Logged Item"}
                          </strong>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {entry.servings} serving{entry.servings > 1 ? "s" : ""} · {Math.round(entry.calories * entry.servings)} kcal (P: {Math.round(entry.protein * entry.servings)}g, C: {Math.round(entry.carbs * entry.servings)}g, F: {Math.round(entry.fat * entry.servings)}g)
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="btn btn-icon btn-ghost"
                          style={{ color: "var(--danger)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD ITEM DIALOG (SEARCH RECIPES / ONE-OFF CUSTOM FORM) */}
      {showAddModal && (
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
              maxWidth: "520px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Log Food to {targetMealSlot}</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-icon btn-ghost" style={{ borderRadius: "50%" }}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", marginBottom: "20px" }}>
              <button
                onClick={() => setActiveAddTab("search")}
                style={{
                  flex: 1,
                  padding: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  borderBottom: activeAddTab === "search" ? "2px solid var(--primary)" : "2px solid transparent",
                  color: activeAddTab === "search" ? "var(--primary-light)" : "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Search Recipes
              </button>
              <button
                onClick={() => setActiveAddTab("custom")}
                style={{
                  flex: 1,
                  padding: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  borderBottom: activeAddTab === "custom" ? "2px solid var(--primary)" : "2px solid transparent",
                  color: activeAddTab === "custom" ? "var(--primary-light)" : "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                Custom Quick Log
              </button>
            </div>

            {/* Search tab content */}
            {activeAddTab === "search" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input
                  type="text"
                  placeholder="Filter recipes by title..."
                  className="input"
                  value={recipeSearchQuery}
                  onChange={(e) => setRecipeSearchQuery(e.target.value)}
                />
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }}>
                  {filteredRecipes.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "16px" }}>
                      No matching recipes found. Seeding or custom builder required.
                    </p>
                  ) : (
                    filteredRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border)",
                          background: "rgba(148, 163, 184, 0.01)",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong style={{ fontSize: "13px" }}>{recipe.title}</strong>
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            {recipe.calories} kcal · P: {recipe.protein}g · C: {recipe.carbs}g · F: {recipe.fat}g
                          </span>
                        </div>
                        <button
                          onClick={() => handleLogRecipe(recipe)}
                          className="btn btn-primary btn-sm"
                          disabled={isSubmitting}
                        >
                          Log
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Custom quick log form content */
              <form onSubmit={handleLogCustom} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="input-group">
                  <label className="input-label">Food/Meal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Scrambled Eggs with Avocado"
                    className="input"
                    value={customFoodName}
                    onChange={(e) => setCustomFoodName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Calories (kcal)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Servings</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="input"
                      value={customServings}
                      onChange={(e) => setCustomServings(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="input-group">
                    <label className="input-label">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(Number(e.target.value))}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Carbs (g)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Fat (g)</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={customFat}
                      onChange={(e) => setCustomFat(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    {isSubmitting ? "Logging..." : "Save Entry"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* APPLY TEMPLATE MODAL */}
      {showTemplateModal && (
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
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            className="glass-card fade-in"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Apply Pre-saved Template</h3>
              <button onClick={() => setShowTemplateModal(false)} className="btn btn-icon btn-ghost" style={{ borderRadius: "50%" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
              {templates.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "16px" }}>
                  You don't have any templates saved. Save a full day log as a template first.
                </p>
              ) : (
                templates.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "rgba(148, 163, 184, 0.01)",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "13px" }}>{t.name}</strong>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Type: {t.label}</span>
                    </div>
                    <button
                      onClick={() => handleApplyTemplate(t.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Apply
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VOICE LOGGING DIALOG */}
      {showVoiceModal && (
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
          onClick={() => setShowVoiceModal(false)}
        >
          <div
            className="glass-card fade-in"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Voice Log to {targetMealSlot}</h3>
              <button onClick={() => setShowVoiceModal(false)} className="btn btn-icon btn-ghost" style={{ borderRadius: "50%" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
              {isListening ? (
                <button
                  type="button"
                  onClick={stopSpeechRecording}
                  className="btn btn-icon pulse-glow"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "var(--danger)",
                    borderColor: "var(--danger)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MicOff size={24} style={{ color: "#030712" }} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startSpeechRecording}
                  className="btn btn-icon"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    borderColor: "var(--primary)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Mic size={24} style={{ color: "#030712" }} />
                </button>
              )}
              <span style={{ fontSize: "13px", fontWeight: 600, color: isListening ? "var(--danger)" : "var(--text-secondary)" }}>
                {isListening ? "Listening... Speak now." : "Tap mic to start dictating meal"}
              </span>
            </div>

            {voiceTranscript && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Captured Transcript:</span>
                <p style={{ fontSize: "13px", color: "var(--text-primary)", fontStyle: "italic", background: "var(--bg-input)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  "{voiceTranscript}"
                </p>
              </div>
            )}

            {isVoiceExtracting && (
              <div style={{ display: "flex", justifyContent: "center", padding: "16px", gap: "8px", alignItems: "center" }}>
                <RefreshCw size={16} className="spinning" style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Extracting nutritional metrics...</span>
              </div>
            )}

            {voiceExtractedFood && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "rgba(16, 185, 129, 0.03)", borderRadius: "var(--radius-md)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <span style={{ fontSize: "11px", color: "var(--primary-light)", fontWeight: 700, textTransform: "uppercase" }}>
                  Extracted Food Analysis
                </span>
                <div>
                  <strong style={{ fontSize: "14px" }}>{voiceExtractedFood.name}</strong>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", textAlign: "center", marginTop: "8px" }}>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Calories</span>
                      <span style={{ fontSize: "11px", fontWeight: 700 }}>{Math.round(voiceExtractedFood.calories)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Protein</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--blue)" }}>{Math.round(voiceExtractedFood.protein)}g</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Carbs</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)" }}>{Math.round(voiceExtractedFood.carbs)}g</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Fat</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--pink)" }}>{Math.round(voiceExtractedFood.fat)}g</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveVoiceLog}
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
                >
                  <Check size={14} />
                  <span>Accept and Save to Log</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHOTO VISION SCANNER DIALOG */}
      {showScanModal && (
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
          onClick={() => setShowScanModal(false)}
        >
          <div
            className="glass-card fade-in"
            style={{
              width: "100%",
              maxWidth: "440px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>AI Food Photo Scanner</h3>
              <button onClick={() => setShowScanModal(false)} className="btn btn-icon btn-ghost" style={{ borderRadius: "50%" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", textAlign: "center" }}>
              <Camera size={36} style={{ color: "var(--primary)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Analyze Food Image</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "250px" }}>
                  Upload a photo of your meal or trigger a mock camera scan to let Claude extract macros automatically.
                </span>
              </div>

              {/* Scan triggers */}
              <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={handleScanMockImage}
                  className="btn btn-primary btn-sm"
                  style={{ gap: "6px" }}
                  disabled={isScanning}
                >
                  {isScanning ? <RefreshCw size={14} className="spinning" /> : <Sparkles size={14} />}
                  <span>Scan Mock Image</span>
                </button>
              </div>
            </div>

            {isScanning && (
              <div style={{ display: "flex", justifyContent: "center", padding: "16px", gap: "8px", alignItems: "center" }}>
                <RefreshCw size={16} className="spinning" style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Claude is analyzing meal contents...</span>
              </div>
            )}

            {scannedResult && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "rgba(16, 185, 129, 0.03)", borderRadius: "var(--radius-md)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--primary-light)", fontWeight: 700, textTransform: "uppercase" }}>
                    Image Analysis Results
                  </span>
                  <span className="badge badge-success" style={{ fontSize: "10px" }}>Confidence: {scannedResult.confidence}</span>
                </div>
                <div>
                  <strong style={{ fontSize: "14px" }}>{scannedResult.name}</strong>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>{scannedResult.notes}</p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", textAlign: "center", marginTop: "12px" }}>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Calories</span>
                      <span style={{ fontSize: "11px", fontWeight: 700 }}>{Math.round(scannedResult.calories)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Protein</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--blue)" }}>{Math.round(scannedResult.protein)}g</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Carbs</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)" }}>{Math.round(scannedResult.carbs)}g</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)", display: "block" }}>Fat</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--pink)" }}>{Math.round(scannedResult.fat)}g</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveScanResult}
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
                >
                  <Check size={14} />
                  <span>Accept and Log Meal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
