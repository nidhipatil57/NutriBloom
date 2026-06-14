"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ChefHat,
  UtensilsCrossed,
  Calendar,
  ShoppingCart,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  Leaf,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Recipes", path: "/recipes", icon: ChefHat },
    { name: "Meal Log", path: "/meals", icon: UtensilsCrossed },
    { name: "Planner", path: "/planner", icon: Calendar },
    { name: "Grocery", path: "/grocery", icon: ShoppingCart },
    { name: "Insights", path: "/insights", icon: BarChart3 },
    { name: "AI Coach", path: "/coach", icon: Bot, isLive: true },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const user = session?.user;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U");

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "var(--sidebar-width)",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: 100,
        padding: "24px 16px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Logo Section */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px", paddingLeft: "8px" }}>
          {/* Ambient Glow */}
          <div
            className="ambient-orb"
            style={{
              top: "-20px",
              left: "-20px",
              width: "100px",
              height: "100px",
              background: "var(--primary-glow)",
              zIndex: -1,
            }}
          />
          <Leaf size={28} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary))" }} />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, var(--text-primary), var(--primary-light))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NutriBloom
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  transition: "all var(--transition)",
                  background: isActive ? "var(--primary-glow)" : "transparent",
                  color: isActive ? "var(--primary-light)" : "var(--text-secondary)",
                  borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                  fontWeight: isActive ? 600 : 500,
                }}
                className={!isActive ? "btn-ghost" : undefined}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Icon size={18} style={{ color: isActive ? "var(--primary)" : "inherit" }} />
                  <span style={{ fontSize: "14px" }}>{item.name}</span>
                </div>
                {item.isLive && (
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--primary)",
                      boxShadow: "0 0 8px var(--primary)",
                    }}
                    className="pulse-glow"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Panel */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "4px" }}>
          {/* Avatar */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--bg-elevated), var(--primary-glow))",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--primary-light)",
            }}
          >
            {user?.image ? (
              <img src={user.image} alt={user.name || ""} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            ) : (
              initial
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name || "NutriBloom User"}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.email || ""}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn btn-secondary btn-sm"
          style={{ width: "100%", justifyContent: "center", gap: "8px" }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
