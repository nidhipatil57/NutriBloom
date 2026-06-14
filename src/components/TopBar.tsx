"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Award, Sparkles, X, Check, AlertTriangle } from "lucide-react";

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "1", title: "Goal Met", message: "You achieved your daily hydration target of 2500ml! 💧", type: "success", time: "10m ago" },
    { id: "2", title: "AI Recommendation", message: "AI Coach suggested a high-protein recipe matching your preferences.", type: "info", time: "1h ago" },
    { id: "3", title: "Meal Reminder", message: "Don't forget to log your dinner entries today.", type: "warning", time: "2h ago" },
  ]);

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

  // Get formatted today's date parts
  const getFormattedDateParts = () => {
    const d = new Date();
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const day = d.toLocaleDateString("en-US", { day: "numeric" });
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.toLocaleDateString("en-US", { year: "numeric" });
    return { weekday, day, month, year };
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
      {/* Left Spacer to push Right items to the right side */}
      <div />

      {/* Center: Creative Date HUD (Centered Absolutely in Viewport) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "8px 20px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(59, 130, 246, 0.04) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.15)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            padding: "4px 8px",
            borderRadius: "8px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--primary-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {getFormattedDateParts().weekday}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.5px" }}>
            {getFormattedDateParts().day}
          </span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            {getFormattedDateParts().month}
          </span>
          <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--text-muted)", marginLeft: "2px" }}>
            {getFormattedDateParts().year}
          </span>
        </div>
      </div>

      {/* Right: Notifications, Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        
        {/* Notifications Icon and Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-ghost btn-icon"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "rgba(15, 23, 42, 0.3)",
              cursor: "pointer",
            }}
          >
            <Bell size={16} style={{ color: "var(--text-secondary)" }} />
            {notifications.length > 0 && (
              /* Notification Dot */
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
            )}
          </button>

          {/* On-screen Notification Dropdown Overlay */}
          {showNotifications && (
            <div
              className="glass-card fade-in"
              style={{
                position: "absolute",
                top: "46px",
                right: 0,
                width: "320px",
                padding: "16px",
                background: "rgba(10, 15, 26, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                zIndex: 200,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>Recent Activity</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setNotifications([])}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "12px" }}>
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const iconColor = n.type === "success" ? "var(--primary-light)" : n.type === "warning" ? "var(--accent)" : "var(--blue)";
                    return (
                      <div
                        key={n.id}
                        style={{
                          display: "flex",
                          gap: "10px",
                          padding: "10px",
                          borderRadius: "var(--radius-md)",
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.03)",
                        }}
                      >
                        <div style={{ marginTop: "2px" }}>
                          {n.type === "success" ? (
                            <Check size={14} style={{ color: iconColor }} />
                          ) : (
                            <AlertTriangle size={14} style={{ color: iconColor }} />
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{n.title}</span>
                            <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{n.time}</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>{n.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

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
