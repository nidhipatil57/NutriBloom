"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Leaf, 
  ArrowRight, 
  Sparkles, 
  ChefHat, 
  Calendar, 
  ShoppingCart, 
  Brain, 
  Bot, 
  Camera, 
  Mic, 
  Award, 
  ChevronRight,
  Check,
  Star,
  Flame,
  Activity,
  Apple,
  Heart,
  Plus,
  Search,
  MessageSquare,
  ChevronDown,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Predefined foods for the interactive scanner simulation
interface FoodItem {
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grade: string;
  color: string;
  details: string[];
}

const FOOD_ITEMS: FoodItem[] = [
  {
    name: "Avocado Sourdough Toast",
    emoji: "🥑🍞",
    calories: 320,
    protein: 9,
    carbs: 38,
    fat: 16,
    grade: "A+",
    color: "from-emerald-600/30 to-green-500/10",
    details: ["Healthy Monounsaturated Fats", "High Fiber (8g)", "Complex Carbs"]
  },
  {
    name: "Seared Salmon Quinoa Bowl",
    emoji: "🍣🥗",
    calories: 540,
    protein: 42,
    carbs: 45,
    fat: 18,
    grade: "A",
    color: "from-rose-500/20 to-orange-400/10",
    details: ["Rich in Omega-3 EPA/DHA", "Complete Protein", "Low Glycemic Index"]
  },
  {
    name: "Wild Berry Acai Smoothie Bowl",
    emoji: "🍓🍇",
    calories: 280,
    protein: 6,
    carbs: 52,
    fat: 7,
    grade: "B+",
    color: "from-purple-600/30 to-pink-500/10",
    details: ["High in Antioxidants", "Vitamin C Boost", "Added plant protein boost"]
  }
];

// Predefined chat simulation messages
interface ChatMessage {
  role: "user" | "coach";
  content: string;
}

const CHAT_QUESTIONS = [
  {
    question: "Analyze my lunch macros",
    response: "Looking at your Salmon Quinoa Bowl: You hit 42g of protein (84% of your midday target). 🍣 Carb profile is excellent with slow-burning quinoa. Add a handful of spinach to boost magnesium!"
  },
  {
    question: "Recommend a recovery snack",
    response: "After your cardio, I suggest 150g Greek Yogurt with a scoop of chia seeds. 🥣 Provides 18g slow-release casein protein to aid muscle recovery and 5g fiber to stabilize blood sugar."
  },
  {
    question: "Adjust plan for low energy",
    response: "I notice a slight drop in your water intake yesterday (1.4L vs 2.5L target) which correlates with energy drops. Let's raise healthy fats slightly in your dinner to support hormone production! 🥑"
  }
];

export default function MarketingLandingPage() {
  // Hero Dashboard Tab state
  const [activeHeroTab, setActiveHeroTab] = useState<"coach" | "scanner" | "planner">("coach");

  // Scanner Simulator states
  const [selectedFoodIdx, setSelectedFoodIdx] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanComplete, setScanComplete] = useState<boolean>(true);

  // Coach Chat Simulator states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "coach", content: "Hi! I'm your NutriBloom Coach. 🌿 Let's optimize your metabolic workspace. Select one of the queries below to see how I can help!" }
  ]);
  const [isCoachTyping, setIsCoachTyping] = useState<boolean>(false);

  // Planner Simulator states
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({
    breakfast: true,
    lunch: false,
    snack: false
  });

  // Goal Calculator states
  const [weight, setWeight] = useState<number>(75);
  const [goal, setGoal] = useState<"loss" | "gain" | "maintain">("loss");
  const [activity, setActivity] = useState<"low" | "moderate" | "high">("moderate");
  const [calculatedCal, setCalculatedCal] = useState<number>(1800);
  const [macroSplits, setMacroSplits] = useState({ protein: 150, carbs: 160, fats: 50 });

  // Feature Showcase states
  const [activeFeature, setActiveFeature] = useState<number>(0);

  // Pricing states
  const [isYearly, setIsYearly] = useState<boolean>(false);

  // FAQ Accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scanner Simulator triggers
  const handleScanFood = (idx: number) => {
    setSelectedFoodIdx(idx);
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1500);
  };

  // Coach Chat triggers
  const handleChatQuestion = (qIdx: number) => {
    if (isCoachTyping) return;
    const item = CHAT_QUESTIONS[qIdx];
    
    // Add user question
    const newMsgs = [...chatMessages, { role: "user" as const, content: item.question }];
    setChatMessages(newMsgs);
    setIsCoachTyping(true);
 
    setTimeout(() => {
      setChatMessages([...newMsgs, { role: "coach" as const, content: item.response }]);
      setIsCoachTyping(false);
    }, 1200);
  };

  // Recalculate macro goals automatically
  useEffect(() => {
    // Basic metabolic formula (approximate TDEE)
    const baseCal = weight * 22;
    let factor = 1.2;
    if (activity === "moderate") factor = 1.45;
    if (activity === "high") factor = 1.7;

    const tdee = Math.round(baseCal * factor);
    
    let targetCal = tdee;
    if (goal === "loss") targetCal = Math.round(tdee - 450);
    if (goal === "gain") targetCal = Math.round(tdee + 300);

    // Protein: 2.0g per kg for gain, 2.2g for loss (to retain muscle), 1.6g for maintain
    let pGrams = Math.round(weight * (goal === "loss" ? 2.2 : goal === "gain" ? 2.0 : 1.8));
    // Fat: 25% of calories
    let fGrams = Math.round((targetCal * 0.25) / 9);
    // Carbs: Remaining calories
    let cGrams = Math.round((targetCal - (pGrams * 4) - (fGrams * 9)) / 4);

    if (cGrams < 40) { // Safety minimum carbs
      cGrams = 40;
      targetCal = (pGrams * 4) + (fGrams * 9) + (cGrams * 4);
    }

    setCalculatedCal(targetCal);
    setMacroSplits({ protein: pGrams, carbs: cGrams, fats: fGrams });
  }, [weight, goal, activity]);

  // Reset demo states when switching tabs to make it clean
  useEffect(() => {
    if (activeHeroTab === "scanner") {
      handleScanFood(0);
    }
  }, [activeHeroTab]);

  return (
    <div 
      className="bg-grid"
      style={{ 
        minHeight: "100vh", 
        color: "#f1f5f9", 
        position: "relative", 
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        // Combine grid and dark premium gradient
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(135deg, #030712 0%, #080c16 50%, #0f172a 100%)
        `,
        backgroundSize: "50px 50px"
      }}
    >
      {/* Decorative Ambient Orbs with animations */}
      <div 
        className="ambient-orb float" 
        style={{ 
          top: "5%", 
          left: "10%", 
          width: "500px", 
          height: "500px", 
          background: "rgba(16, 185, 129, 0.08)",
          filter: "blur(140px)"
        }} 
      />
      <div 
        className="ambient-orb float-delayed" 
        style={{ 
          top: "40%", 
          right: "5%", 
          width: "550px", 
          height: "550px", 
          background: "rgba(6, 182, 212, 0.06)",
          filter: "blur(160px)"
        }} 
      />
      <div 
        className="ambient-orb float" 
        style={{ 
          bottom: "10%", 
          left: "15%", 
          width: "400px", 
          height: "400px", 
          background: "rgba(139, 92, 246, 0.05)",
          filter: "blur(130px)"
        }} 
      />

      {/* Navigation Header */}
      <header 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "18px 48px", 
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)", 
          backdropFilter: "blur(24px)",
          background: "rgba(3, 7, 18, 0.75)",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "8px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
            <Leaf size={24} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 6px var(--primary))" }} />
          </div>
          <span style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.75px", background: "linear-gradient(135deg, #ffffff 40%, var(--primary-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            NutriBloom
          </span>
        </div>

        <nav className="hide-on-mobile" style={{ display: "flex", gap: "32px", fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)" }}>
          <a href="#features" className="hover-link" style={{ transition: "color 0.2s" }}>Modules</a>
          <a href="#calculator" className="hover-link" style={{ transition: "color 0.2s" }}>Architect</a>
          <a href="#pricing" className="hover-link" style={{ transition: "color 0.2s" }}>Pricing</a>
          <a href="#faq" className="hover-link" style={{ transition: "color 0.2s" }}>FAQ</a>
        </nav>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <Link href="/login" className="btn btn-secondary btn-sm" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", padding: "8px 18px", borderRadius: "var(--radius-md)" }}>
            Log In
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm btn-sheen" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", border: "1px solid var(--primary)", color: "#030712", padding: "8px 18px", borderRadius: "var(--radius-md)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>
            Join the Bloom
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, zIndex: 10 }}>
        
        {/* Section 1: Hero split 2-column layout */}
        <section style={{ maxWidth: "1300px", margin: "0 auto", padding: "80px 24px 100px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "48px", alignItems: "center" }} className="grid-2">
          
          {/* Left Column: Headline and CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="badge badge-primary fade-in" style={{ padding: "8px 16px", fontSize: "12px", gap: "8px", width: "fit-content", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "100px", color: "var(--primary-light)", fontWeight: 700 }}>
              <Sparkles size={14} className="pulse-glow" style={{ color: "var(--primary-light)" }} />
              <span style={{ letterSpacing: "0.02em" }}>INTRODUCING NUTRIBLOOM OS v2.0</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h1 
                className="slide-up"
                style={{ 
                  fontSize: "62px", 
                  fontWeight: 900, 
                  lineHeight: 1.05, 
                  letterSpacing: "-2px",
                  background: "linear-gradient(135deg, #ffffff 20%, #e2e8f0 60%, var(--primary-light) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Where Nutrition <br />
                <span style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>meets Intelligence</span>
              </h1>

              <p 
                className="slide-up fade-in-delay-1"
                style={{ 
                  fontSize: "24px", 
                  fontWeight: 800,
                  color: "var(--primary-light)",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2
                }}
              >
                Wellness, Beautifully Simplified
              </p>
            </div>

            <p 
              className="slide-up fade-in-delay-1"
              style={{ 
                fontSize: "18px", 
                color: "var(--text-secondary)", 
                lineHeight: 1.6, 
                maxWidth: "600px" 
              }}
            >
              Don't just count calories. Re-architect your health with real-time bio-audits, weekly autonomous planners, and a dedicated AI Metabolic Coach.
            </p>

            {/* Social Trust Metrics */}
            <div className="slide-up fade-in-delay-2" style={{ display: "flex", alignItems: "center", gap: "24px", margin: "8px 0" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "3px", color: "#fbbf24" }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="#fbbf24" style={{ stroke: "none" }} />)}
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", fontWeight: 600 }}>
                  Rated 4.9/5 by 50,000+ members
                </span>
              </div>
              <div style={{ width: "1px", height: "30px", background: "rgba(255, 255, 255, 0.1)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={18} style={{ color: "var(--primary-light)" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                  #1 Nutrition App of 2026
                </span>
              </div>
            </div>

            <div 
              className="slide-up fade-in-delay-3"
              style={{ 
                display: "flex", 
                gap: "16px", 
                alignItems: "center"
              }}
            >
              <Link href="/signup" className="btn btn-primary btn-lg btn-sheen" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", border: "1px solid var(--primary)", color: "#030712", gap: "10px", padding: "16px 36px", boxShadow: "0 8px 30px rgba(16, 185, 129, 0.2)" }}>
                <span>Build Your Profile</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg glow-border" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", padding: "16px 30px" }}>
                <span>Enter Workspace</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Graphic Image */}
          <div style={{ position: "relative" }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="glass-card" 
              style={{ 
                borderRadius: "var(--radius-xl)", 
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(16, 185, 129, 0.05)",
                overflow: "hidden",
                background: "rgba(10, 15, 26, 0.6)",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Image 
                src="/nutribloom_hero_graphic.png" 
                alt="Where Nutrition meets Intelligence"
                width={560}
                height={500}
                priority
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "var(--radius-lg)",
                  display: "block",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)"
                }}
              />
            </motion.div>
          </div>
        </section>

        {/* Section 2: Trust Banner Statistics */}
        <section style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", background: "rgba(255, 255, 255, 0.01)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", textAlign: "center" }} className="grid-2">
            <div>
              <h3 style={{ fontSize: "32px", fontWeight: 900, background: "linear-gradient(135deg, #ffffff, var(--primary-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>50,000+</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Users</p>
            </div>
            <div>
              <h3 style={{ fontSize: "32px", fontWeight: 900, background: "linear-gradient(135deg, #ffffff, var(--primary-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>99.2%</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Food Scan Accuracy</p>
            </div>
            <div>
              <h3 style={{ fontSize: "32px", fontWeight: 900, background: "linear-gradient(135deg, #ffffff, var(--primary-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>1.2M+</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Meals Tracked</p>
            </div>
            <div>
              <h3 style={{ fontSize: "32px", fontWeight: 900, background: "linear-gradient(135deg, #ffffff, var(--primary-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>24/7</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Coaching Availability</p>
            </div>
          </div>
        </section>

        {/* Section 3: Interactive Goal Architect (Calculator) */}
        <section id="calculator" style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="badge badge-accent" style={{ marginBottom: "12px", padding: "4px 12px", background: "rgba(245,158,11,0.08)", color: "var(--accent)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "100px", fontWeight: 700 }}>METABOLIC LAB</span>
            <h2 style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-1px", color: "#ffffff" }}>Architect Your Goals Instantly</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px", maxWidth: "600px", margin: "8px auto 0" }}>Adjust the dials to witness NutriBloom OS dynamically re-architect your calorie limits and macro thresholds in real-time.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" }} className="grid-2">
            
            {/* Input fields */}
            <div className="glass-card glow-border" style={{ padding: "32px", borderRadius: "var(--radius-xl)", background: "rgba(10, 15, 26, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Weight Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Current Weight</span>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-light)" }}>{weight} kg</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="150" 
                    value={weight} 
                    onChange={(e) => setWeight(parseInt(e.target.value))}
                    style={{ accentColor: "var(--primary)", height: "6px", borderRadius: "100px", cursor: "pointer", background: "rgba(255, 255, 255, 0.1)" }}
                  />
                </div>

                {/* Primary Objective */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Dietary Objective</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <button 
                      onClick={() => setGoal("loss")}
                      style={{
                        padding: "12px 6px",
                        background: goal === "loss" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        borderColor: goal === "loss" ? "var(--primary)" : "rgba(255, 255, 255, 0.06)",
                        color: goal === "loss" ? "var(--primary-light)" : "var(--text-secondary)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Weight Loss
                    </button>
                    <button 
                      onClick={() => setGoal("maintain")}
                      style={{
                        padding: "12px 6px",
                        background: goal === "maintain" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        borderColor: goal === "maintain" ? "var(--primary)" : "rgba(255, 255, 255, 0.06)",
                        color: goal === "maintain" ? "var(--primary-light)" : "var(--text-secondary)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Maintenance
                    </button>
                    <button 
                      onClick={() => setGoal("gain")}
                      style={{
                        padding: "12px 6px",
                        background: goal === "gain" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        borderColor: goal === "gain" ? "var(--primary)" : "rgba(255, 255, 255, 0.06)",
                        color: goal === "gain" ? "var(--primary-light)" : "var(--text-secondary)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Muscle Gain
                    </button>
                  </div>
                </div>

                {/* Activity Scale */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Physical Activity Scale</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <button 
                      onClick={() => setActivity("low")}
                      style={{
                        padding: "12px 6px",
                        background: activity === "low" ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        borderColor: activity === "low" ? "var(--cyan)" : "rgba(255, 255, 255, 0.06)",
                        color: activity === "low" ? "var(--cyan)" : "var(--text-secondary)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Sedentary
                    </button>
                    <button 
                      onClick={() => setActivity("moderate")}
                      style={{
                        padding: "12px 6px",
                        background: activity === "moderate" ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        borderColor: activity === "moderate" ? "var(--cyan)" : "rgba(255, 255, 255, 0.06)",
                        color: activity === "moderate" ? "var(--cyan)" : "var(--text-secondary)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Moderately Active
                    </button>
                    <button 
                      onClick={() => setActivity("high")}
                      style={{
                        padding: "12px 6px",
                        background: activity === "high" ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        borderColor: activity === "high" ? "var(--cyan)" : "rgba(255, 255, 255, 0.06)",
                        color: activity === "high" ? "var(--cyan)" : "var(--text-secondary)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Highly Active
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Live calculated results */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="glass-card" style={{ padding: "28px", borderRadius: "var(--radius-xl)", background: "rgba(10, 15, 26, 0.7)", border: "1px solid rgba(16, 185, 129, 0.25)", boxShadow: "0 10px 30px rgba(16, 185, 129, 0.05)" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calculated Calorie Target</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
                  <span style={{ fontSize: "48px", fontWeight: 950, color: "#ffffff", letterSpacing: "-1.5px" }}>{calculatedCal}</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-secondary)" }}>kcal/day</span>
                </div>
                
                <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Protein target */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", fontSize: "12px", fontWeight: 700 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Apple size={14} style={{ color: "var(--primary)" }} /> Protein</span>
                      <span>{macroSplits.protein}g ({macroSplits.protein * 4} kcal)</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--primary)", width: `${Math.min(100, (macroSplits.protein / 200) * 100)}%`, transition: "width 0.3s ease-out" }} />
                    </div>
                  </div>

                  {/* Carbs target */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", fontSize: "12px", fontWeight: 700 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Flame size={14} style={{ color: "var(--accent)" }} /> Carbohydrates</span>
                      <span>{macroSplits.carbs}g ({macroSplits.carbs * 4} kcal)</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--accent)", width: `${Math.min(100, (macroSplits.carbs / 300) * 100)}%`, transition: "width 0.3s ease-out" }} />
                    </div>
                  </div>

                  {/* Fats target */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", fontSize: "12px", fontWeight: 700 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Heart size={14} style={{ color: "var(--cyan)" }} /> Healthy Fats</span>
                      <span>{macroSplits.fats}g ({macroSplits.fats * 9} kcal)</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--cyan)", width: `${Math.min(100, (macroSplits.fats / 100) * 100)}%`, transition: "width 0.3s ease-out" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <Bot size={20} style={{ color: "var(--primary-light)" }} />
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  <strong>Metabolic Tip:</strong> Keeping protein at {macroSplits.protein}g will support metabolic thermo-burn and lean mass protection during calorie deficits.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Section 4: Interactive Feature Showcase */}
        <section id="features" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(3, 7, 18, 0.3)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 24px" }}>
            
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <span className="badge badge-primary" style={{ marginBottom: "12px", padding: "4px 12px" }}>CORE MODULES</span>
              <h2 style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-1px" }}>Connected Health Modules</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "8px", maxWidth: "600px", margin: "8px auto 0" }}>Every module is fully synthesized, feeding data into your metabolic database in real-time.</p>
            </div>

            {/* Feature Modules selectors grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }} className="grid-3">
              {[
                { icon: ChefHat, title: "Recipe Discovery Vault", desc: "Search compliant recipes with complete macro auditing and bookmark saving.", glow: "rgba(16, 185, 129, 0.15)", border: "var(--primary-light)" },
                { icon: Calendar, title: "Weekly Diet Planner", desc: "Map meals to a 7x4 scheduler or let AI Autopilot recommend weekly guidelines.", glow: "rgba(245, 158, 11, 0.15)", border: "var(--accent-light)" },
                { icon: ShoppingCart, title: "Aisle Grocery Compiler", desc: "Instantly compile ingredients from planned diets into checkout ready lists.", glow: "rgba(6, 182, 212, 0.15)", border: "#22d3ee" },
                { icon: Brain, title: "Mood & Energy Sync", desc: "Correlate water, calories, and training outputs with daily focus graphs.", glow: "rgba(139, 92, 246, 0.15)", border: "#a78bfa" },
                { icon: Bot, title: "Conversational Coach", desc: "Chat with a metabolic assistant auditing food selections on the go.", glow: "rgba(236, 72, 153, 0.15)", border: "#f472b6" },
                { icon: Camera, title: "AI Vision & Voice Scanner", desc: "Point camera to log meal estimations or dictate logs via audio.", glow: "rgba(59, 130, 246, 0.15)", border: "#60a5fa" }
              ].map((feat, idx) => {
                const IconComponent = feat.icon;
                const isSelected = activeFeature === idx;
                return (
                  <div 
                    key={idx}
                    onClick={() => setActiveFeature(idx)}
                    className="glass-card glow-border"
                    style={{
                      padding: "24px",
                      cursor: "pointer",
                      background: isSelected ? "rgba(10, 15, 26, 0.75)" : "rgba(10, 15, 26, 0.3)",
                      border: isSelected ? `1px solid ${feat.border}` : "1px solid rgba(255,255,255,0.05)",
                      boxShadow: isSelected ? `0 10px 30px ${feat.glow}` : "none",
                      transform: isSelected ? "translateY(-4px)" : "none",
                      transition: "all 0.3s ease-out"
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: feat.glow, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconComponent size={20} style={{ color: feat.border }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: isSelected ? "#ffffff" : "var(--text-primary)" }}>{feat.title}</h3>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{feat.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Showcase Screen */}
            <div className="glass-card" style={{ padding: "32px", borderRadius: "var(--radius-xl)", background: "rgba(10, 15, 26, 0.65)", border: "1px solid rgba(255,255,255,0.06)", minHeight: "240px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  {activeFeature === 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px", alignItems: "center" }} className="grid-2">
                      <div>
                        <span className="badge badge-primary" style={{ marginBottom: "8px" }}>RECIPE VAULT</span>
                        <h3 style={{ fontSize: "24px", fontWeight: 800 }}>Explore 15,000+ Smart Meals</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "10px" }}>
                          Filter recipes dynamically based on your allergies, specific protein quotas, or low-carb targets. Each card compiles exact measurements matching your weekly grocery list autonomously.
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize: "24px" }}>🥗</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between" }}>
                              <strong style={{ fontSize: "12px" }}>Crunchy Keto Tofu Salad</strong>
                              <span style={{ fontSize: "11px", color: "var(--primary-light)" }}>420 kcal</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                              <span style={{ fontSize: "9px", background: "rgba(16,185,129,0.1)", color: "var(--primary-light)", padding: "2px 6px", borderRadius: "4px" }}>Low Carb</span>
                              <span style={{ fontSize: "9px", background: "rgba(245,158,11,0.1)", color: "var(--accent-light)", padding: "2px 6px", borderRadius: "4px" }}>22g Protein</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize: "24px" }}>🍤</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between" }}>
                              <strong style={{ fontSize: "12px" }}>Garlic Butter Shrimp Zoodles</strong>
                              <span style={{ fontSize: "11px", color: "var(--primary-light)" }}>310 kcal</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                              <span style={{ fontSize: "9px", background: "rgba(6,182,212,0.1)", color: "#22d3ee", padding: "2px 6px", borderRadius: "4px" }}>Keto</span>
                              <span style={{ fontSize: "9px", background: "rgba(245,158,11,0.1)", color: "var(--accent-light)", padding: "2px 6px", borderRadius: "4px" }}>28g Protein</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 1 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px", alignItems: "center" }} className="grid-2">
                      <div>
                        <span className="badge badge-accent" style={{ marginBottom: "8px" }}>PLANNER</span>
                        <h3 style={{ fontSize: "24px", fontWeight: 800 }}>Drag-and-Drop Auto Scheduler</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "10px" }}>
                          Simply click and assign recipes to your 7x4 schedule structure. The planner compiles overall nutritional targets and flashes warning indicators if your daily iron or magnesium goals drop too low.
                        </p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                        {["Mon", "Tue", "Wed"].map((day, dIdx) => (
                          <div key={dIdx} style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{day}</span>
                            <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", borderRadius: "6px", padding: "6px", fontSize: "10px", color: "var(--primary-light)", marginTop: "8px" }}>
                              Egg Cups
                            </div>
                            <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "6px", padding: "6px", fontSize: "10px", color: "var(--accent-light)", marginTop: "6px" }}>
                              Salmon
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeFeature === 2 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px", alignItems: "center" }} className="grid-2">
                      <div>
                        <span className="badge" style={{ marginBottom: "8px", background: "rgba(6,182,212,0.15)", color: "#22d3ee" }}>GROCERY</span>
                        <h3 style={{ fontSize: "24px", fontWeight: 800 }}>Autonomous Aisle Compiler</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "10px" }}>
                          No more tedious note writing. Our compiler pools the exact ingredient requirements from your weekly plan and groups them by supermarket aisle automatically.
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                          { item: "Organic Baby Spinach", category: "Produce Section" },
                          { item: "Atlantic Salmon Fillets", category: "Seafood Counter" },
                          { item: "Unsweetened Almond Milk", category: "Dairy/Alternative" }
                        ].map((g, gIdx) => (
                          <div key={gIdx} style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Check size={14} style={{ color: "var(--primary)" }} />
                              <span style={{ fontSize: "12px", fontWeight: 600 }}>{g.item}</span>
                            </div>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{g.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeFeature === 3 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px", alignItems: "center" }} className="grid-2">
                      <div>
                        <span className="badge" style={{ marginBottom: "8px", background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>COGNITIVE</span>
                        <h3 style={{ fontSize: "24px", fontWeight: 800 }}>Mood-Energy Bio Correlations</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "10px" }}>
                          Observe how your food correlates with daily focus, emotional status, and sleep stability. The system extracts patterns (e.g. "Energy rises 20% on days with &gt;75g protein before 1 PM").
                        </p>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h4 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px" }}>Focus Correlation Report</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", fontSize: "11px" }}>
                            <span>High Protein Days</span>
                            <span style={{ color: "var(--primary-light)", fontWeight: 700 }}>9.2 / 10 Focus Factor</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "100px" }}>
                            <div style={{ height: "100%", background: "var(--primary)", width: "92%" }} />
                          </div>
                          <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", fontSize: "11px", marginTop: "4px" }}>
                            <span>High Sugar Days</span>
                            <span style={{ color: "var(--danger)", fontWeight: 700 }}>4.5 / 10 Focus Factor</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "100px" }}>
                            <div style={{ height: "100%", background: "var(--danger)", width: "45%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 4 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px", alignItems: "center" }} className="grid-2">
                      <div>
                        <span className="badge" style={{ marginBottom: "8px", background: "rgba(236,72,153,0.15)", color: "#f472b6" }}>AI COACH</span>
                        <h3 style={{ fontSize: "24px", fontWeight: 800 }}>Metabolic AI Partner</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "10px" }}>
                          Your AI Coach is fully integrated with your databases. It evaluates breakfast photos, answers diet queries, and automatically logs meals through voice or text command prompts.
                        </p>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <Bot size={14} style={{ color: "#f472b6" }} />
                          <strong style={{ fontSize: "11px" }}>Coach Suggestion:</strong>
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          "You've hit 80% of your fat target but only 45% of protein for today. For dinner, swap the beef salad for cod or grilled chicken breast to protect your caloric ceiling."
                        </p>
                      </div>
                    </div>
                  )}

                  {activeFeature === 5 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px", alignItems: "center" }} className="grid-2">
                      <div>
                        <span className="badge" style={{ marginBottom: "8px", background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>SCANNER</span>
                        <h3 style={{ fontSize: "24px", fontWeight: 800 }}>Scan and Log Instantly</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "10px" }}>
                          Snap a photo of your plate or dictate a quick sentence: "Logged a cup of Greek Yogurt with wild berries." The system parses ingredients, estimates calories, and updates your dashboard instantly.
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <Mic size={16} style={{ color: "#60a5fa" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Voice Transcription</div>
                            <div style={{ fontSize: "11px", fontWeight: 600 }}>"A banana and 30g almonds for snack"</div>
                          </div>
                          <span style={{ fontSize: "9px", background: "rgba(16,185,129,0.1)", color: "var(--primary-light)", padding: "2px 6px", borderRadius: "4px" }}>Logged</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <Camera size={16} style={{ color: "#60a5fa" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Vision Analysis</div>
                            <div style={{ fontSize: "11px", fontWeight: 600 }}>"Detected: Avocado Toast 🥑"</div>
                          </div>
                          <span style={{ fontSize: "9px", background: "rgba(16,185,129,0.1)", color: "var(--primary-light)", padding: "2px 6px", borderRadius: "4px" }}>Logged</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </section>

        {/* Section 5: Pricing Plans */}
        <section id="pricing" style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="badge badge-accent" style={{ marginBottom: "12px", padding: "4px 12px" }}>MEMBERSHIP</span>
            <h2 style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-1px" }}>Transparent Billing Tiers</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>Unlock full metabolic autonomy with our curated tier system. No hidden fees.</p>

            {/* Monthly / Yearly Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: !isYearly ? "var(--primary-light)" : "var(--text-secondary)" }}>Monthly</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                style={{
                  width: "44px",
                  height: "24px",
                  borderRadius: "100px",
                  background: "var(--primary)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div 
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#030712",
                    transform: isYearly ? "translateX(20px)" : "translateX(0)",
                    transition: "transform 0.2s"
                  }} 
                />
              </button>
              <span style={{ fontSize: "13px", fontWeight: 700, color: isYearly ? "var(--primary-light)" : "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                Yearly <span style={{ fontSize: "10px", background: "rgba(16,185,129,0.15)", color: "var(--primary-light)", padding: "2px 6px", borderRadius: "100px", fontWeight: 800 }}>Save 20%</span>
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: "24px", alignItems: "stretch" }} className="grid-3">
            
            {/* Seedling Plan (Free) */}
            <div className="glass-card glow-border" style={{ padding: "32px", borderRadius: "var(--radius-xl)", background: "rgba(10, 15, 26, 0.45)", border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", justifySelf: "stretch", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Seedling Tier</span>
                <h3 style={{ fontSize: "28px", fontWeight: 900, marginTop: "8px" }}>Free</h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>Kickstart your logs with baseline calorie tracking tools.</p>
                
                <div style={{ height: "1px", background: "var(--border)", margin: "20px 0" }} />
                
                <ul style={{ display: "flex", flexDirection: "column", gap: "12px", listStyle: "none", fontSize: "13px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary)" }} />
                    <span>Basic Recipe Search</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary)" }} />
                    <span>Daily Calorie Logging</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary)" }} />
                    <span>5 AI Plate Scans per day</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)" }}>
                    <X size={16} />
                    <span>No 24/7 AI Coach access</span>
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: "32px", padding: "12px" }}>
                Get Started
              </Link>
            </div>

            {/* Bloom Plan (Pro - Recommended) */}
            <div className="glass-card" style={{ padding: "40px 32px 32px", borderRadius: "var(--radius-xl)", background: "rgba(10, 20, 35, 0.75)", border: "2px solid var(--primary-light)", boxShadow: "0 10px 40px var(--primary-glow)", display: "flex", flexDirection: "column", justifySelf: "stretch", justifyContent: "space-between", position: "relative" }}>
              <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, var(--primary), var(--cyan))", color: "#030712", fontWeight: 800, fontSize: "10px", padding: "4px 14px", borderRadius: "100px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Most Popular
              </div>
              
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary-light)", textTransform: "uppercase" }}>Bloom Tier</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "8px" }}>
                  <h3 style={{ fontSize: "40px", fontWeight: 950, color: "#ffffff" }}>
                    {isYearly ? "$7.99" : "$9.99"}
                  </h3>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>/ month</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>Our gold standard: full AI companion scan & automated planning.</p>
                
                <div style={{ height: "1px", background: "var(--border)", margin: "20px 0" }} />
                
                <ul style={{ display: "flex", flexDirection: "column", gap: "12px", listStyle: "none", fontSize: "13px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary-light)" }} />
                    <strong>Unlimited AI Food Scanning</strong>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary-light)" }} />
                    <strong>24/7 Conversational AI Coach</strong>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary-light)" }} />
                    <span>Auto Weekly Diet Planner</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary-light)" }} />
                    <span>Smart Grocery Compiling</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary-light)" }} />
                    <span>Detailed Metabolic Wave reports</span>
                  </li>
                </ul>
              </div>
              
              <Link href="/signup" className="btn btn-primary btn-sheen" style={{ width: "100%", justifyContent: "center", marginTop: "32px", padding: "14px", border: "1px solid var(--primary-light)", color: "#030712" }}>
                Upgrade to Bloom
              </Link>
            </div>

            {/* Forest Plan (Enterprise) */}
            <div className="glass-card glow-border" style={{ padding: "32px", borderRadius: "var(--radius-xl)", background: "rgba(10, 15, 26, 0.45)", border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", justifySelf: "stretch", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Forest Tier</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "8px" }}>
                  <h3 style={{ fontSize: "28px", fontWeight: 900 }}>
                    {isYearly ? "$23.99" : "$29.99"}
                  </h3>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>/ month</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>Collaborate with private dietitians or compile shared family plans.</p>
                
                <div style={{ height: "1px", background: "var(--border)", margin: "20px 0" }} />
                
                <ul style={{ display: "flex", flexDirection: "column", gap: "12px", listStyle: "none", fontSize: "13px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary)" }} />
                    <span>Up to 5 Family Accounts</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary)" }} />
                    <span>Export reports to Dietitians</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary)" }} />
                    <span>Priority Server scan speeds</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--primary)" }} />
                    <strong>Shared Interactive Grocery List</strong>
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: "32px", padding: "12px" }}>
                Choose Forest
              </Link>
            </div>

          </div>
        </section>

        {/* Section 6: Testimonials Grid */}
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(3, 7, 18, 0.3)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 24px" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <span className="badge badge-primary" style={{ marginBottom: "12px", padding: "4px 12px" }}>TESTIMONIALS</span>
              <h2 style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-1px" }}>Endorsed by Professionals</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>See how NutriBloom is reforming tracking for members and health coaches.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }} className="grid-3">
              {[
                { name: "Dr. Elena Rostova", title: "Metabolic Researcher, MD", text: "NutriBloom's closed-loop structure sets it apart. The way it correlates mood variables directly with macro splits is scientifically grounding.", initial: "ER", color: "rgba(16, 185, 129, 0.1)" },
                { name: "Marcus Thorne", title: "Certified Athletic Trainer", text: "My clients used to forget logging. With NutriBloom's dictation and AI scanner, adherence rose by 70%. It is a complete game changer for muscle recovery.", initial: "MT", color: "rgba(6, 182, 212, 0.1)" },
                { name: "Sophia Martinez", title: "Bloom Premium Member", text: "The AI coach saved me. I simply tell it what I ate or snap a picture, and it tells me how to balance protein target ratios for dinner. Down 10kg already!", initial: "SM", color: "rgba(139, 92, 246, 0.1)" }
              ].map((test, idx) => (
                <div key={idx} className="glass-card glow-border" style={{ padding: "28px", borderRadius: "16px", background: "rgba(10, 15, 26, 0.45)", border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", justifySelf: "stretch", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", gap: "3px", color: "#fbbf24", marginBottom: "16px" }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" style={{ border: "none" }} />)}
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>
                      "{test.text}"
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: test.color, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", fontWeight: 700 }}>
                      {test.initial}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>{test.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{test.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: FAQ Accordions */}
        <section id="faq" style={{ maxWidth: "800px", margin: "0 auto", padding: "100px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="badge badge-accent" style={{ marginBottom: "12px", padding: "4px 12px" }}>QUESTIONS</span>
            <h2 style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-1px" }}>Frequently Answered FAQs</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>Everything you need to know about the NutriBloom ecosystem.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { q: "How does the closed-loop tracking work?", a: "Unlike standard loggers where you copy numbers blindly, NutriBloom syncs your grocery shopping cart, recipe selections, daily metabolic limits, and physical activity logs. The AI Coach audits this complete database and automatically highlights discrepancies in real-time." },
              { q: "Is the AI scanner accurate for home-cooked meals?", a: "Yes! Our visual recognition algorithm estimates food volume and splits components down to approximate macro ratios. If you have custom ingredients, you can dictate or tell the AI Coach: 'Audit my salad: added 20g cheese and 15g walnuts' to refine details." },
              { q: "Can I export my grocery lists?", a: "Absolutely. Once compiled, you can download your shopping lists as formatted PDFs or copy raw text to import directly into third-party delivery apps like Instacart." },
              { q: "Can I sync with wearable trackers like Apple Health or Fitbit?", a: "Yes. NutriBloom integrates directly with active wearable devices to automatically import steps, daily calorie expenditures, and workout timings to adjust daily nutritional ceilings." }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="glass-card" 
                  style={{ 
                    borderRadius: "12px", 
                    background: "rgba(10, 15, 26, 0.45)", 
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    overflow: "hidden"
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: "100%",
                      padding: "20px 24px",
                      background: "transparent",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 700,
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={18} 
                      style={{ 
                        transform: isOpen ? "rotate(180deg)" : "rotate(0)", 
                        transition: "transform 0.2s",
                        color: isOpen ? "var(--primary-light)" : "var(--text-secondary)" 
                      }} 
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div style={{ padding: "0 24px 20px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer 
        style={{ 
          borderTop: "1px solid rgba(255, 255, 255, 0.06)", 
          background: "#030712",
          zIndex: 10
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 24px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "40px", marginBottom: "48px" }} className="grid-2">
            
            {/* Logo and Pitch */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Leaf size={24} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 6px var(--primary))" }} />
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff" }}>NutriBloom</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "260px" }}>
                The high-performance metabolic operating system designed to optimize human longevity and nutritional balance.
              </p>
            </div>

            {/* Product Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#ffffff" }}>Product</h4>
              <a href="#features" style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="hover-white">Connected Modules</a>
              <a href="#calculator" style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="hover-white">Metabolic Architect</a>
              <a href="#pricing" style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="hover-white">Pricing Plans</a>
            </div>

            {/* Company Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#ffffff" }}>Company</h4>
              <a href="#" style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="hover-white">About Science</a>
              <a href="#" style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="hover-white">Research Papers</a>
              <a href="#" style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="hover-white">Security & GDPR</a>
            </div>

            {/* Support Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#ffffff" }}>Resources</h4>
              <a href="#" style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="hover-white">Developer API</a>
              <a href="#" style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="hover-white">Privacy Policy</a>
              <a href="#" style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="hover-white">Terms of Service</a>
            </div>

          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "32px 0" }} />

          <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", fontSize: "11px", color: "var(--text-muted)" }}>
            <span>© {new Date().getFullYear()} NutriBloom OS. All rights reserved.</span>
            <span>Created for Google DeepMind Coding Partnership. Powered by Next.js & Prisma.</span>
          </div>
        </div>
      </footer>

      {/* Embedded CSS for hover transitions on standard links */}
      <style jsx global>{`
        .hover-link:hover {
          color: var(--primary-light) !important;
        }
        .hover-white:hover {
          color: #ffffff !important;
        }
        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
