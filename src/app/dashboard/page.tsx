"use client";

import React, { useEffect, useState, startTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Flame,
  Beef,
  Droplet,
  TrendingUp,
  Plus,
  Search,
  Calendar,
  Bot,
  Sparkles,
  ChevronRight,
  PlusCircle,
  PlusSquare,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import ProgressRing from "@/components/ProgressRing";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface MealTimelineEntry {
  id: string;
  customName: string | null;
  recipeTitle: string | null;
  calories: number;
  protein: number;
}

interface DashboardMeal {
  mealType: string;
  caloriesSum: number;
  entries: MealTimelineEntry[];
}

interface DashboardData {
  goals: {
    calorieTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
    waterTargetMl: number;
  };
  todayLog: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  };
  meals: DashboardMeal[];
  insights: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
  }>;
  weeklyCalories: Array<{ day: string; calories: number }>;
  waterLog: {
    amountMl: number;
  };
  bloomScore: number;
  achievements: Array<{
    id: string;
    title: string;
    icon: string;
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard stats
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        error("Could not fetch dashboard metrics.");
      }
    } catch (err) {
      console.error(err);
      error("An error occurred while loading dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  // Quick add water logic
  const handleQuickAddWater = async (amount: number) => {
    if (!data) return;
    try {
      const res = await fetch("/api/water", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: amount }),
      });

      if (res.ok) {
        const updated = await res.json();
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            waterLog: { amountMl: updated.amountMl },
          };
        });
        success(`Added ${amount}ml of water! 💧`);
      } else {
        error("Failed to log water.");
      }
    } catch (err) {
      console.error(err);
      error("Error logging water.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ height: "48px", width: "300px" }} className="skeleton" />
        <div className="grid-4" style={{ height: "120px" }}>
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "16px", height: "400px" }}>
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </div>
    );
  }

  const goals = data?.goals || {
    calorieTarget: 2000,
    proteinTarget: 150,
    carbTarget: 250,
    fatTarget: 65,
    waterTargetMl: 2500,
  };

  const today = data?.todayLog || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  };

  const waterAmount = data?.waterLog?.amountMl || 0;
  const calPercent = Math.round((today.totalCalories / goals.calorieTarget) * 100) || 0;
  const proteinPercent = Math.round((today.totalProtein / goals.proteinTarget) * 100) || 0;
  const carbPercent = Math.round((today.totalCarbs / goals.carbTarget) * 100) || 0;
  const fatPercent = Math.round((today.totalFat / goals.fatTarget) * 100) || 0;
  const waterPercent = Math.round((waterAmount / goals.waterTargetMl) * 100) || 0;

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hrs = new Date().getHours();
    const name = session?.user?.name ? session.user.name.split(" ")[0] : "Alex";
    if (hrs < 12) return `Good morning, ${name} 👋`;
    if (hrs < 17) return `Good afternoon, ${name} 👋`;
    return `Good evening, ${name} 👋`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      {/* Row 1: Greeting + Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            {getGreeting()}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "2px" }}>
            Here is your nutrition blueprint dashboard for today.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link href="/meals">
            <button className="btn btn-primary btn-sm">
              <PlusCircle size={14} />
              <span>Log Meal</span>
            </button>
          </Link>
          <Link href="/recipes">
            <button className="btn btn-secondary btn-sm">
              <Search size={14} />
              <span>Find Recipe</span>
            </button>
          </Link>
          <Link href="/planner">
            <button className="btn btn-secondary btn-sm">
              <Calendar size={14} />
              <span>Plan Week</span>
            </button>
          </Link>
          <Link href="/coach">
            <button className="btn btn-secondary btn-sm">
              <Bot size={14} style={{ color: "var(--primary)" }} />
              <span>AI Coach</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Row 2: Stats Bar (3 cards) */}
      <div className="grid-3">
        {/* Calories Card */}
        <div className="glass-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "10px", borderRadius: "var(--radius-md)", background: "rgba(245, 158, 11, 0.15)" }}>
            <Flame size={20} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Calories Logged</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              {Math.round(today.totalCalories)} <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ {goals.calorieTarget} kcal</span>
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="glass-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "10px", borderRadius: "var(--radius-md)", background: "rgba(59, 130, 246, 0.15)" }}>
            <Beef size={20} style={{ color: "var(--blue)" }} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Protein Eaten</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              {Math.round(today.totalProtein)}g <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ {goals.proteinTarget}g</span>
            </div>
          </div>
        </div>

        {/* Hydration Card */}
        <div className="glass-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "10px", borderRadius: "var(--radius-md)", background: "rgba(6, 182, 212, 0.15)" }}>
            <Droplet size={20} style={{ color: "var(--cyan)" }} />
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Water Hydration</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              {waterAmount}ml <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ {goals.waterTargetMl}ml</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Main Grid (Calorie Ring + Macros + Timeline) */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "16px" }}>
        {/* Left Column: Progress Rings Card */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
          {/* Calorie Ring */}
          <div>
            <ProgressRing
              percentage={calPercent}
              size={180}
              strokeWidth={14}
              color={calPercent > 100 ? "var(--danger)" : "var(--primary)"}
              value={Math.round(today.totalCalories)}
              label="Eaten"
              sublabel={`of ${goals.calorieTarget}`}
            />
          </div>

          {/* Mini Stats Below Calorie Ring */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-around", borderTop: "1px solid var(--border)", paddingTop: "16px", textAlign: "center" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Eaten</span>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>{Math.round(today.totalCalories)}</div>
            </div>
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "16px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Remaining</span>
              <div style={{ fontSize: "16px", fontWeight: 700, color: calPercent > 100 ? "var(--danger)" : "var(--primary-light)", marginTop: "2px" }}>
                {Math.max(0, Math.round(goals.calorieTarget - today.totalCalories))}
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: "1px", background: "var(--border)" }} />

          {/* Hydration Widget */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Hydration Log</span>
              {waterAmount >= goals.waterTargetMl && (
                <span className="badge badge-success">Goal reached! 💧</span>
              )}
            </div>
            <ProgressRing
              percentage={waterPercent}
              size={110}
              strokeWidth={8}
              color="var(--cyan)"
              value={`${waterAmount}ml`}
              label="Hydrated"
            />
            {/* Quick Add Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", width: "100%", marginTop: "6px" }}>
              {[150, 250, 330, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickAddWater(amt)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: "6px 0", fontSize: "11px", width: "100%", justifyContent: "center" }}
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Macros & Meal Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Top: Macros Progress Card */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Macronutrient Adherence</h3>
            <div className="grid-3">
              {/* Protein Bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600 }}>
                  <span style={{ color: "var(--blue)" }}>💪 Protein</span>
                  <span>{Math.round(today.totalProtein)}g / {goals.proteinTarget}g</span>
                </div>
                <div style={{ height: "6px", background: "rgba(148, 163, 184, 0.08)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: "var(--blue)",
                      width: `${Math.min(100, proteinPercent)}%`,
                      borderRadius: "var(--radius-full)",
                      transition: "width 0.8s ease-out",
                    }}
                  />
                </div>
              </div>

              {/* Carbs Bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600 }}>
                  <span style={{ color: "var(--accent)" }}>🌾 Carbs</span>
                  <span>{Math.round(today.totalCarbs)}g / {goals.carbTarget}g</span>
                </div>
                <div style={{ height: "6px", background: "rgba(148, 163, 184, 0.08)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: "var(--accent)",
                      width: `${Math.min(100, carbPercent)}%`,
                      borderRadius: "var(--radius-full)",
                      transition: "width 0.8s ease-out",
                    }}
                  />
                </div>
              </div>

              {/* Fat Bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600 }}>
                  <span style={{ color: "var(--pink)" }}>💧 Fat</span>
                  <span>{Math.round(today.totalFat)}g / {goals.fatTarget}g</span>
                </div>
                <div style={{ height: "6px", background: "rgba(148, 163, 184, 0.08)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: "var(--pink)",
                      width: `${Math.min(100, fatPercent)}%`,
                      borderRadius: "var(--radius-full)",
                      transition: "width 0.8s ease-out",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Today's Meal Timeline */}
          <div className="glass-card" style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Today's Food Timeline</h3>
              <Link href="/meals" style={{ fontSize: "12px", color: "var(--primary-light)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>Log meal logs</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {["breakfast", "lunch", "dinner"].map((mealType) => {
                const foundMeal = data?.meals.find(
                  (m) => m.mealType.toLowerCase() === mealType.toLowerCase()
                );
                const colorMap: Record<string, string> = {
                  breakfast: "var(--cyan)",
                  lunch: "var(--primary)",
                  dinner: "var(--purple)",
                };
                const mealColor = colorMap[mealType];

                return (
                  <div
                    key={mealType}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: mealColor,
                          boxShadow: `0 0 8px ${mealColor}`,
                        }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: 700, textTransform: "capitalize", color: "var(--text-primary)" }}>
                        {mealType}
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {foundMeal && foundMeal.entries.length > 0
                          ? foundMeal.entries
                              .map((e) => e.customName || e.recipeTitle)
                              .join(", ")
                          : "No entries logged"}
                      </span>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {foundMeal ? Math.round(foundMeal.caloriesSum) : 0} kcal
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Insights & Achievements & Weekly Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        {/* Left: Weekly Area Chart & Insights */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Chart */}
          <div className="glass-card" style={{ padding: "20px", height: "300px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>Calorie Consumption Trends</h3>
            <div style={{ width: "100%", height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.weeklyCalories || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <ReferenceLine y={goals.calorieTarget} stroke="var(--danger)" strokeDasharray="3 3" label={{ value: "Goal", fill: "var(--danger)", fontSize: 10, position: "top" }} />
                  <Area type="monotone" dataKey="calories" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, paddingLeft: "4px" }}>Daily Nutrition Insights</h3>
            {data?.insights && data.insights.length > 0 ? (
              data.insights.map((ins) => {
                const borderMap: Record<string, string> = {
                  success: "var(--success)",
                  warning: "var(--warning)",
                  info: "var(--info)",
                };
                const leftColor = borderMap[ins.severity] || "var(--info)";

                return (
                  <div
                    key={ins.id}
                    className="glass-card"
                    style={{
                      padding: "12px 16px",
                      borderLeft: `4px solid ${leftColor}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{ins.title}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{ins.description}</span>
                  </div>
                );
              })
            ) : (
              <div className="glass-card" style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No insights logged. Log meals regularly to trigger intelligence insights.
              </div>
            )}
          </div>
        </div>

        {/* Right: Unlocked Achievements */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Recent Achievements</h3>
            <Link href="/insights" style={{ fontSize: "12px", color: "var(--primary-light)" }}>
              View All
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              flex: 1,
            }}
          >
            {data?.achievements && data.achievements.length > 0 ? (
              data.achievements.map((ach) => (
                <div
                  key={ach.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>{ach.icon || "🏆"}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginTop: "6px",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {ach.title}
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: "span 2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                }}
              >
                No achievements unlocked yet. Log your first meal to start!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
