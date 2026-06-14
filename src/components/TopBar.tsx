"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Award, Sparkles } from "lucide-react";

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [bloomScore, setBloomScore] = useState<number>(75); // fallback default

  useEffect(() => {
    // Fetch live BloomScore
    const fetchBloom = async () => {
      try {
        const res = await fetch("/api/bloom");
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.score === "number") {
            setBloomScore(Math.round(data.score));
          }
        }
      } catch (err) {
        console.error("Failed to fetch BloomScore in TopBar:", err);
      }
    };
    if (session) {
      fetchBloom();
      // Also register a listener for recalculation notifications
      const handleRecalc = () => fetchBloom();
      window.addEventListener("bloomRecalculated", handleRecalc);
      return () => window.removeEventListener("bloomRecalculated", handleRecalc);
    }
  }, [session, pathname]);

  // Determine page title and breadcrumbs
  const getPageTitleAndBreadcrumb = () => {
    if (!pathname) return { title: "Dashboard", crumb: "NutriBloom" };
    if (pathname.startsWith("/dashboard")) return { title: "Dashboard Overview", crumb: "Dashboard" };
    if (pathname.startsWith("/recipes/create")) return { title: "Create Custom Recipe", crumb: "Recipes / Create" };
    if (pathname.startsWith("/recipes")) return { title: "Recipe Discovery", crumb: "Recipes" };
    if (pathname.startsWith("/meals")) return { title: "Daily Meal Log", crumb: "Meal Log" };
    if (pathname.startsWith("/planner")) return { title: "Weekly Meal Planner", crumb: "Planner" };
    if (pathname.startsWith("/grocery")) return { title: "Weekly Grocery Checklist", crumb: "Grocery List" };
    if (pathname.startsWith("/insights")) return { title: "Insights & Analytics", crumb: "Insights" };
    if (pathname.startsWith("/coach")) return { title: "AI Dietary Coach", crumb: "AI Coach" };
    if (pathname.startsWith("/settings")) return { title: "Account Settings", crumb: "Settings" };
    return { title: "NutriBloom Intelligence", crumb: "Dashboard" };
  };

  const { title, crumb } = getPageTitleAndBreadcrumb();

  // Get formatted today's date
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    return new Date().toLocaleDateString("en-US", options);
  };

  const initial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : (session?.user?.email ? session.user.email.charAt(0).toUpperCase() : "U");

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: "var(--sidebar-width)",
        right: 0,
        height: "var(--topbar-height)",
        background: "rgba(3, 7, 18, 0.4)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        zIndex: 90,
      }}
    >
      {/* Left: Section Title & Breadcrumb */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {crumb}
        </span>
        <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px", marginTop: "2px" }}>
          {title}
        </h1>
      </div>

      {/* Center: Styled Date Pill */}
      <div
        className="glass-card"
        style={{
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          background: "rgba(15, 23, 42, 0.4)",
          border: "1px solid var(--border)",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }} />
        <span>{getFormattedDate()}</span>
      </div>

      {/* Right: Score, Notifications, Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {/* BloomScore Indicator */}
        <Link href="/insights" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            className="glass-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              background: "rgba(16, 185, 129, 0.08)",
              borderColor: "rgba(16, 185, 129, 0.2)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Sparkles size={14} style={{ color: "var(--primary-light)" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--primary-light)", letterSpacing: "0.03em", textTransform: "uppercase", lineHeight: 1 }}>
                BloomScore
              </span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary-light)", lineHeight: 1.1, marginTop: "2px" }}>
                {bloomScore}
              </span>
            </div>
          </div>
        </Link>

        {/* Notifications Icon */}
        <button
          className="btn btn-ghost btn-icon"
          style={{
            position: "relative",
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "rgba(15, 23, 42, 0.3)",
          }}
        >
          <Bell size={16} style={{ color: "var(--text-secondary)" }} />
          {/* Notification Dot */}
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 6px var(--accent)",
            }}
          />
        </button>

        {/* User Avatar */}
        <Link href="/settings">
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--bg-elevated), var(--primary-glow))",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--primary-light)",
            }}
          >
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name || ""} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            ) : (
              initial
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default TopBar;
