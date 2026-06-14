"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, ShieldAlert, Check, RefreshCw, Upload, Sparkles } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { success, error } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [joinedDate, setJoinedDate] = useState("");

  // Goals
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinTarget, setProteinTarget] = useState(150);
  const [carbTarget, setCarbTarget] = useState(250);
  const [fatTarget, setFatTarget] = useState(65);
  const [dietType, setDietType] = useState("balanced");
  const [waterTargetMl, setWaterTargetMl] = useState(2500);

  // Preferences
  const [cuisinePrefs, setCuisinePrefs] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikedInput, setDislikedInput] = useState("");
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState(60);

  // Notifications
  const [mealReminders, setMealReminders] = useState(true);
  const [achievementUnlocks, setAchievementUnlocks] = useState(true);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const json = await res.json();
          setName(json.profile.name || "");
          setEmail(json.profile.email || "");
          setImage(json.profile.image || "");
          setJoinedDate(new Date(json.profile.createdAt).toLocaleDateString());

          setCalorieTarget(json.goals.calorieTarget);
          setProteinTarget(json.goals.proteinTarget);
          setCarbTarget(json.goals.carbTarget);
          setFatTarget(json.goals.fatTarget);
          setDietType(json.goals.dietType);
          setWaterTargetMl(json.goals.waterTargetMl);

          setCuisinePrefs(JSON.parse(json.preferences.cuisines || "[]"));
          setAllergies(JSON.parse(json.preferences.allergies || "[]"));
          setDislikedIngredients(JSON.parse(json.preferences.dislikedIngredients || "[]"));
          setMaxPrepTime(json.preferences.maxPrepTime);
        } else {
          error("Failed to load settings.");
        }
      } catch (err) {
        console.error(err);
        error("Error fetching settings.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchSettings();
    }
  }, [session]);

  // Live macro calculations
  const proteinCals = proteinTarget * 4;
  const carbCals = carbTarget * 4;
  const fatCals = fatTarget * 9;
  const calculatedTotal = proteinCals + carbCals + fatCals;

  const proteinPct = calculatedTotal > 0 ? Math.round((proteinCals / calculatedTotal) * 100) : 0;
  const carbPct = calculatedTotal > 0 ? Math.round((carbCals / calculatedTotal) * 100) : 0;
  const fatPct = calculatedTotal > 0 ? Math.round((fatCals / calculatedTotal) * 100) : 0;

  // File Upload avatar to base64
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error("Image size must be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit settings updates
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image,
          calorieTarget,
          proteinTarget,
          carbTarget,
          fatTarget,
          dietType,
          waterTargetMl,
          cuisines: JSON.stringify(cuisinePrefs),
          allergies: JSON.stringify(allergies),
          dislikedIngredients: JSON.stringify(dislikedIngredients),
          maxPrepTime,
        }),
      });

      if (res.ok) {
        success("Settings updated successfully!");
        update(); // Update session state
      } else {
        const data = await res.json();
        error(data.error || "Failed to update settings.");
      }
    } catch (err) {
      console.error(err);
      error("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "DELETE",
      });
      if (res.ok) {
        success("Account permanently deleted.");
        signOut({ callbackUrl: "/" });
      } else {
        error("Failed to delete account.");
      }
    } catch (err) {
      console.error(err);
      error("Error deleting account.");
    }
  };

  // Preference list configurations
  const allCuisines = ["Italian", "Mexican", "Asian", "Indian", "Mediterranean", "American", "Middle Eastern"];
  const allAllergies = ["Dairy", "Nuts", "Gluten", "Soy", "Shellfish", "Eggs"];

  const toggleCuisine = (c: string) => {
    setCuisinePrefs((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const toggleAllergy = (a: string) => {
    setAllergies((prev) =>
      prev.includes(a) ? prev.filter((item) => item !== a) : [...prev, a]
    );
  };

  const handleAddDisliked = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && dislikedInput.trim()) {
      e.preventDefault();
      if (!dislikedIngredients.includes(dislikedInput.trim())) {
        setDislikedIngredients((prev) => [...prev, dislikedInput.trim()]);
      }
      setDislikedInput("");
    }
  };

  const removeDisliked = (ing: string) => {
    setDislikedIngredients((prev) => prev.filter((item) => item !== ing));
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ height: "150px" }} className="skeleton" />
        <div className="grid-2" style={{ height: "400px" }}>
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      {/* Save Floating Bar */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "rgba(10, 15, 26, 0.8)",
          borderColor: "rgba(16, 185, 129, 0.2)",
          position: "sticky",
          top: "var(--topbar-height)",
          zIndex: 80,
          marginTop: "-16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={16} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: "14px", fontWeight: 600 }}>Unsaved changes will be lost. Click save to store settings.</span>
        </div>
        <button
          onClick={handleSave}
          className="btn btn-primary btn-sm"
          style={{ width: "120px", justifyContent: "center" }}
          disabled={isSaving}
        >
          {isSaving ? (
            <RefreshCw size={14} className="spinning" />
          ) : (
            <>
              <Check size={14} />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Profile Section */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>User Profile</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              {/* Avatar Upload */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: "2px solid var(--border)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                    fontSize: "24px",
                    fontWeight: 800,
                  }}
                >
                  {image ? (
                    <img src={image} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>
                <label
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    right: "-4px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    border: "2px solid var(--bg-card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <Upload size={12} style={{ color: "#030712" }} />
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} style={{ display: "none" }} />
                </label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <div className="input-group">
                  <label className="input-label">Display Name</label>
                  <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid-2" style={{ marginTop: "4px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>Email (Read-only)</span>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{email}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>Joined NutriBloom</span>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Targets */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Nutrition Goals</h3>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Daily Calorie Target (kcal)</label>
                <input type="number" className="input" value={calorieTarget} onChange={(e) => setCalorieTarget(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label className="input-label">Diet Classification</label>
                <select className="input" value={dietType} onChange={(e) => setDietType(e.target.value)}>
                  <option value="balanced">Balanced Diet</option>
                  <option value="high-protein">High Protein</option>
                  <option value="keto">Keto (Low Carb)</option>
                  <option value="vegan">Vegan / Plant-Based</option>
                  <option value="vegetarian">Vegetarian</option>
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="input-group">
                <label className="input-label">Protein Target (g)</label>
                <input type="number" className="input" value={proteinTarget} onChange={(e) => setProteinTarget(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label className="input-label">Carbs Target (g)</label>
                <input type="number" className="input" value={carbTarget} onChange={(e) => setCarbTarget(Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label className="input-label">Fat Target (g)</label>
                <input type="number" className="input" value={fatTarget} onChange={(e) => setFatTarget(Number(e.target.value))} />
              </div>
            </div>

            {/* Live macro splits calculator */}
            <div style={{ background: "var(--bg-elevated)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                <span>Live Macro Split (Calculated: {calculatedTotal} kcal)</span>
                <span>{proteinPct}% P · {carbPct}% C · {fatPct}% F</span>
              </div>
              <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", background: "rgba(148, 163, 184, 0.08)" }}>
                <div style={{ width: `${proteinPct}%`, background: "var(--blue)", transition: "width 0.3s" }} />
                <div style={{ width: `${carbPct}%`, background: "var(--accent)", transition: "width 0.3s" }} />
                <div style={{ width: `${fatPct}%`, background: "var(--pink)", transition: "width 0.3s" }} />
              </div>
            </div>

            {/* Water Target */}
            <div className="input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="input-label">Daily Hydration Target</label>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--cyan)" }}>{waterTargetMl} ml</span>
              </div>
              <input
                type="range"
                min="1000"
                max="5000"
                step="250"
                value={waterTargetMl}
                onChange={(e) => setWaterTargetMl(Number(e.target.value))}
                style={{
                  accentColor: "var(--cyan)",
                  background: "var(--bg-input)",
                  height: "6px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Food Preferences */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Dietary & Food Preferences</h3>

            {/* Cuisine multi-select */}
            <div className="input-group">
              <label className="input-label">Favorite Cuisines</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                {allCuisines.map((c) => {
                  const selected = cuisinePrefs.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCuisine(c)}
                      className={`btn btn-sm ${selected ? "btn-primary" : "btn-secondary"}`}
                      style={{ borderRadius: "var(--radius-full)" }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allergies multi-select */}
            <div className="input-group">
              <label className="input-label">Allergies & Intolerances</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                {allAllergies.map((a) => {
                  const selected = allergies.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() => toggleAllergy(a)}
                      className={`btn btn-sm ${selected ? "btn-danger" : "btn-secondary"}`}
                      style={{ borderRadius: "var(--radius-full)" }}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disliked ingredients tag list */}
            <div className="input-group">
              <label className="input-label">Excluded / Disliked Ingredients</label>
              <input
                type="text"
                placeholder="Type ingredient and press Enter..."
                className="input"
                value={dislikedInput}
                onChange={(e) => setDislikedInput(e.target.value)}
                onKeyDown={handleAddDisliked}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                {dislikedIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="badge badge-info"
                    style={{
                      cursor: "pointer",
                      padding: "4px 10px",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={() => removeDisliked(ing)}
                  >
                    <span>{ing}</span>
                    <span style={{ fontSize: "10px", fontWeight: "bold" }}>×</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Max Cooking Time slider */}
            <div className="input-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="input-label">Maximum Recipe Cook Time</label>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-light)" }}>{maxPrepTime} mins</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={maxPrepTime}
                onChange={(e) => setMaxPrepTime(Number(e.target.value))}
                style={{
                  accentColor: "var(--accent)",
                  background: "var(--bg-input)",
                  height: "6px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>

          {/* Notifications config */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Notifications</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>Meal Reminders</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Send push alerts if you forget to log meal entries</span>
                </div>
                {/* CSS toggle switch */}
                <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer" }}>
                  <input type="checkbox" checked={mealReminders} onChange={() => setMealReminders(!mealReminders)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: mealReminders ? "var(--primary)" : "rgba(148, 163, 184, 0.1)",
                      borderRadius: "24px",
                      transition: "0.2s",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      content: '""',
                      height: "18px",
                      width: "18px",
                      left: mealReminders ? "22px" : "3px",
                      bottom: "3px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "50%",
                      transition: "0.2s",
                    }}
                  />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>Achievements & Badges</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Notify you instantly when new milestones are reached</span>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer" }}>
                  <input type="checkbox" checked={achievementUnlocks} onChange={() => setAchievementUnlocks(!achievementUnlocks)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: achievementUnlocks ? "var(--primary)" : "rgba(148, 163, 184, 0.1)",
                      borderRadius: "24px",
                      transition: "0.2s",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      content: '""',
                      height: "18px",
                      width: "18px",
                      left: achievementUnlocks ? "22px" : "3px",
                      bottom: "3px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "50%",
                      transition: "0.2s",
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="glass-card" style={{ padding: "24px", borderColor: "rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.03)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f87171", marginBottom: "8px" }}>Danger Zone</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Permanently delete your account and remove all logged food history, goals, planner calendars, and credentials.
            </p>
            <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger btn-sm">
              <ShieldAlert size={14} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="glass-card fade-in" style={{ width: "100%", maxWidth: "400px", padding: "28px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f87171" }}>Confirm Account Deletion</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "12px 0 20px 0", lineHeight: 1.5 }}>
              Are you absolutely sure you want to delete your account? This action is irreversible. All of your meal logs, planner configs, and stats will be permanently erased.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="btn btn-danger btn-sm">
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
