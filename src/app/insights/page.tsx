"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  ReferenceLine 
} from "recharts";
import { 
  BarChart3, 
  Brain, 
  Activity, 
  TrendingUp, 
  Flame, 
  Target, 
  Calendar,
  Sparkles,
  RefreshCw,
  Award
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface DailyData {
  date: string;
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AnalyticsData {
  dailyData: DailyData[];
  averages: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    trackedDaysCount: number;
    goalHitRate: number;
  };
  goals: {
    calorieTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
  };
}

export default function InsightsPage() {
  const { error } = useToast();
  
  const [range, setRange] = useState<"week" | "month">("week");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [moodInsights, setMoodInsights] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsAndInsights = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Analytics
      const analRes = await fetch(`/api/analytics?range=${range}`);
      if (analRes.ok) {
        const analJson = await analRes.json();
        setAnalytics(analJson);
      } else {
        error("Failed to load analytics trends.");
      }

      // 2. Fetch Mood Correlation Insights
      const moodRes = await fetch("/api/insights/mood");
      if (moodRes.ok) {
        const moodJson = await moodRes.json();
        setMoodInsights(moodJson.insights || []);
      }
    } catch (err) {
      console.error(err);
      error("Error loading insights panel.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsAndInsights();
  }, [range]);

  if (isLoading || !analytics) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
        <div style={{ height: "120px" }} className="skeleton" />
        <div className="grid-2" style={{ height: "300px" }}>
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </div>
    );
  }

  const { dailyData, averages, goals } = analytics;

  // Custom tooltips for glassmorphism style
  const CustomCalorieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: "var(--bg-card)", 
          border: "1px solid var(--border)", 
          borderRadius: "var(--radius-md)", 
          padding: "10px 14px", 
          backdropFilter: "blur(20px)" 
        }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>{payload[0].payload.label}</span>
          <strong style={{ fontSize: "14px", color: "var(--primary-light)" }}>{payload[0].value} kcal</strong>
        </div>
      );
    }
    return null;
  };

  const CustomMacroTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: "var(--bg-card)", 
          border: "1px solid var(--border)", 
          borderRadius: "var(--radius-md)", 
          padding: "12px", 
          backdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>{payload[0].payload.label}</span>
          {payload.map((item: any) => (
            <span key={item.name} style={{ fontSize: "12px", color: item.color, display: "block" }}>
              {item.name}: <strong>{item.value}g</strong>
            </span>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      
      {/* Header and Toggle Selector */}
      <div className="glass-card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BarChart3 size={20} style={{ color: "var(--primary)" }} />
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Nutrition Insights & Correlation Analytics</h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Examine metabolic trends, macro ratios, and cognitive correlation reports.
            </p>
          </div>
        </div>

        {/* Range Selector Switcher */}
        <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", padding: "2px" }}>
          <button
            onClick={() => setRange("week")}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              fontWeight: 600,
              background: range === "week" ? "var(--primary-glow)" : "none",
              border: "none",
              color: range === "week" ? "var(--primary-light)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all var(--transition)"
            }}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setRange("month")}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              fontWeight: 600,
              background: range === "month" ? "var(--primary-glow)" : "none",
              border: "none",
              color: range === "month" ? "var(--primary-light)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all var(--transition)"
            }}
          >
            Past 30 Days
          </button>
        </div>
      </div>

      {/* Aggregate Score Cards */}
      <div className="grid-4">
        {/* Avg Calorie */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Avg Daily Intake</span>
            <Flame size={16} style={{ color: "var(--accent)" }} />
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 800 }}>{averages.avgCalories} kcal</h3>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target: {goals.calorieTarget} kcal</span>
        </div>

        {/* Goal Hit Rate */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Calorie Adherence</span>
            <Target size={16} style={{ color: "var(--primary)" }} />
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 800 }}>{averages.goalHitRate}%</h3>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Days within 15% deviation</span>
        </div>

        {/* Avg Protein */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Avg Protein Intake</span>
            <Activity size={16} style={{ color: "var(--blue)" }} />
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 800 }}>{averages.avgProtein}g</h3>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target: {goals.proteinTarget}g</span>
        </div>

        {/* Tracked Days */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>Days Tracked</span>
            <Calendar size={16} style={{ color: "var(--purple)" }} />
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 800 }}>{averages.trackedDaysCount}</h3>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Out of last {range === "week" ? 7 : 30} days</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px" }}>
        
        {/* Left Side: Trends Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Calorie Trend Chart */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} style={{ color: "var(--primary)" }} />
              <span>Caloric Deviation Graph</span>
            </h3>
            
            <div style={{ width: "100%", height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomCalorieTooltip />} />
                  <Area type="monotone" dataKey="calories" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCalories)" name="Calories" />
                  <ReferenceLine y={goals.calorieTarget} stroke="var(--danger)" strokeDasharray="5 5" label={{ value: "Goal", position: "left", fill: "var(--danger)", fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macro Breakdown Chart */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart3 size={16} style={{ color: "var(--blue)" }} />
              <span>Daily Macro Balancing Ratio</span>
            </h3>

            <div style={{ width: "100%", height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomMacroTooltip />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="protein" stackId="a" fill="var(--blue)" name="Protein" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="carbs" stackId="a" fill="var(--accent)" name="Carbs" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="fat" stackId="a" fill="var(--pink)" name="Fat" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: Cognitive Mood Correlation Reports */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Mood Correlations Card */}
          <div className="glass-card" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Brain size={20} style={{ color: "var(--cyan)" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Cognitive Mood Correlations</h3>
            </div>
            
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Our AI engine correlates your daily water intake, caloric deviation percentages, and protein hits against logged mood and energy scores.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "4px" }}>
              {moodInsights.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", textAlign: "center", gap: "10px", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                  <Award size={24} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    No insights generated yet. Continue logging meals and daily mood logs to formulate correlations.
                  </span>
                </div>
              ) : (
                moodInsights.map((insight, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      background: "var(--bg-elevated)", 
                      border: "1px solid var(--border)", 
                      borderRadius: "var(--radius-md)", 
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px"
                    }}
                  >
                    <Sparkles size={16} style={{ color: "var(--cyan)", marginTop: "2px", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {insight}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
