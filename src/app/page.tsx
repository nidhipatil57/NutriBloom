"use client";

import React from "react";
import Link from "next/link";
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
  ChevronRight
} from "lucide-react";

export default function MarketingLandingPage() {
  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        background: "var(--bg-primary)", 
        color: "var(--text-primary)", 
        position: "relative", 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      {/* Background Orbs */}
      <div 
        className="ambient-orb float" 
        style={{ 
          top: "10%", 
          left: "15%", 
          width: "450px", 
          height: "450px", 
          background: "rgba(16, 185, 129, 0.08)",
          filter: "blur(120px)"
        }} 
      />
      <div 
        className="ambient-orb float-delayed" 
        style={{ 
          bottom: "15%", 
          right: "10%", 
          width: "500px", 
          height: "500px", 
          background: "rgba(6, 182, 212, 0.08)",
          filter: "blur(140px)"
        }} 
      />

      {/* Navigation Header */}
      <header 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "24px 48px", 
          borderBottom: "1px solid var(--border)", 
          backdropFilter: "blur(20px)",
          background: "rgba(3, 7, 18, 0.4)",
          zIndex: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Leaf size={28} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary))" }} />
          <span style={{ fontSize: "20px", fontWeight: 800, background: "linear-gradient(135deg, var(--text-primary), var(--primary-light))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            NutriBloom
          </span>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <Link href="/login" className="btn btn-secondary btn-sm" style={{ padding: "10px 20px" }}>
            Log In
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm" style={{ padding: "10px 20px" }}>
            Join the Bloom
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "80px 24px", gap: "64px", zIndex: 10 }}>
        
        {/* Hero Headline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px", maxWidth: "800px" }}>
          <div className="badge badge-primary fade-in" style={{ padding: "6px 14px", fontSize: "12px", gap: "6px" }}>
            <Sparkles size={12} />
            <span>Introducing the Closed-Loop Nutrition Intelligence OS</span>
          </div>

          <h1 
            className="slide-up"
            style={{ 
              fontSize: "56px", 
              fontWeight: 900, 
              lineHeight: 1.1, 
              letterSpacing: "-1.5px",
              background: "linear-gradient(135deg, var(--text-primary) 30%, var(--primary-light))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginTop: "10px"
            }}
          >
            Closed-Loop Nutrition Intelligence OS
          </h1>

          <p 
            className="slide-up fade-in-delay-1"
            style={{ 
              fontSize: "18px", 
              color: "var(--text-secondary)", 
              lineHeight: 1.6, 
              maxWidth: "600px" 
            }}
          >
            Don't just count calories. Search, plan, log, and analyze your metabolic health under a dedicated Conversational AI Coach.
          </p>

          <div 
            className="slide-up fade-in-delay-2"
            style={{ 
              display: "flex", 
              gap: "16px", 
              marginTop: "16px" 
            }}
          >
            <Link href="/signup" className="btn btn-primary btn-lg" style={{ gap: "8px" }}>
              <span>Build Your Profile</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              <span>Enter Workspace</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", maxWidth: "1200px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, textAlign: "center", marginBottom: "8px" }}>
            Fully Connected Health Modules
          </h2>
          
          <div className="grid-3">
            {/* Feature 1 */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChefHat size={20} style={{ color: "var(--primary-light)" }} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Recipe Discovery Vault</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Search diet-compliant recipes with complete ingredient mappings, macro-auditing ratios, and quick bookmark saving.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={20} style={{ color: "var(--accent-light)" }} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Weekly Diet Planner</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Map recipes to a 7x4 scheduler, track adherence indicators, or let AI Autopilot generate recommendation plans.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingCart size={20} style={{ color: "#22d3ee" }} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Aisle Grocery Compiler</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Instantly aggregate ingredients from planned meals into aisle-grouped shopping lists with checking completion rewards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={20} style={{ color: "#a78bfa" }} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Cognitive Mood Correlations</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Track daily water, calorie deviation, and protein targets to compile correlation reports matching mood and energy levels.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "rgba(236, 72, 153, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={20} style={{ color: "#f472b6" }} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Conversational AI Coach</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Chat with a dedicated coach that audits your logs, lists macro adjustments, and generates post-workout snacks.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={20} style={{ color: "#60a5fa" }} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>AI Vision & Voice Loggers</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Upload a photo to scanner-estimate recipe calories instantly, or dictate food slots using native Web Speech transcription.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        style={{ 
          padding: "32px 48px", 
          borderTop: "1px solid var(--border)", 
          textAlign: "center", 
          fontSize: "13px", 
          color: "var(--text-muted)", 
          zIndex: 10,
          background: "rgba(3, 7, 18, 0.2)"
        }}
      >
        <span>© {new Date().getFullYear()} NutriBloom OS. Powered by Anthropic Claude & Prisma ORM.</span>
      </footer>
    </div>
  );
}
