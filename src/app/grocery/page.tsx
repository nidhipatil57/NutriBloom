"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Calendar, 
  Trash2, 
  Sparkles, 
  CheckSquare, 
  Square,
  Check,
  RefreshCw,
  Gift,
  Plus
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface GroceryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  aisle: string;
  checked: boolean;
}

interface GroceryList {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  items: GroceryItem[];
}

export default function GroceryPage() {
  const { success, error } = useToast();
  
  // Date Selector range (defaults to current week)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(today.setDate(diff));
    return mon.toLocaleDateString("en-CA");
  });
  
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const sun = new Date(today.setDate(diff + 6));
    return sun.toLocaleDateString("en-CA");
  });

  const [lists, setLists] = useState<GroceryList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchLists = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/grocery");
      if (res.ok) {
        const json = await res.json();
        setLists(json);
      } else {
        error("Failed to load grocery lists.");
      }
    } catch (err) {
      console.error(err);
      error("Error fetching grocery lists.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (res.ok) {
        success("Successfully compiled planned recipes into shopping list!");
        fetchLists();
      } else {
        const data = await res.json();
        error(data.error || "Failed to generate list. Ensure recipes are planned in dates.");
      }
    } catch (err) {
      console.error(err);
      error("Error generating grocery list.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleItem = async (itemId: string, listIdx: number, itemIdx: number) => {
    // Optimistic UI toggle
    setLists((prev) => {
      const next = [...prev];
      const items = [...next[listIdx].items];
      items[itemIdx] = { ...items[itemIdx], checked: !items[itemIdx].checked };
      next[listIdx] = { ...next[listIdx], items };
      return next;
    });

    try {
      const res = await fetch("/api/grocery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchLists();
        error("Failed to update item.");
      }
    } catch (err) {
      console.error(err);
      fetchLists();
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      const res = await fetch(`/api/grocery?listId=${listId}`, { method: "DELETE" });
      if (res.ok) {
        success("Grocery list deleted.");
        fetchLists();
      } else {
        error("Failed to delete grocery list.");
      }
    } catch (err) {
      console.error(err);
      error("Error deleting list.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      
      {/* Header and Generator Form */}
      <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingCart size={20} style={{ color: "var(--primary)" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Aisle-Grouped Shopping Lists</h2>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Automatically compile ingredients from your weekly planned recipes, grouped neatly by store aisles.
          </p>
        </div>

        <form onSubmit={handleGenerate} style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="input-group" style={{ width: "180px" }}>
            <label className="input-label">Start Date</label>
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ width: "180px" }}>
            <label className="input-label">End Date</label>
            <input
              type="date"
              className="input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ gap: "6px" }}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw size={14} className="spinning" />
            ) : (
              <Plus size={14} />
            )}
            <span>Generate List from Plan</span>
          </button>
        </form>
      </div>

      {/* Lists Display */}
      {isLoading ? (
        <div className="skeleton" style={{ height: "300px" }} />
      ) : lists.length === 0 ? (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 32px", textAlign: "center", gap: "16px" }}>
          <ShoppingCart size={48} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No grocery lists compiled</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "400px" }}>
            Plan some meals in your Weekly Planner first, then generate a grocery list above for that date range!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {lists.map((list, listIdx) => {
            const totalItems = list.items.length;
            const checkedItems = list.items.filter((i) => i.checked).length;
            const isCompleted = totalItems > 0 && totalItems === checkedItems;

            // Group items by aisle
            const groupedItems: Record<string, typeof list.items> = {};
            list.items.forEach((item) => {
              const aisle = item.aisle || "Other";
              if (!groupedItems[aisle]) {
                groupedItems[aisle] = [];
              }
              groupedItems[aisle].push(item);
            });

            return (
              <div 
                key={list.id} 
                className="glass-card" 
                style={{ 
                  padding: "24px",
                  borderColor: isCompleted ? "var(--primary)" : "var(--glass-border)"
                }}
              >
                
                {/* List Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800 }}>{list.name}</h3>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Progress: {checkedItems} / {totalItems} items checked
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="btn btn-secondary btn-icon"
                    style={{ color: "var(--danger)" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Celebration Overlay if Complete */}
                {isCompleted && (
                  <div 
                    style={{ 
                      background: "rgba(16, 185, 129, 0.05)", 
                      border: "1px solid var(--primary)", 
                      padding: "16px", 
                      borderRadius: "var(--radius-lg)", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "12px",
                      marginBottom: "20px"
                    }}
                    className="pulse-glow"
                  >
                    <Gift size={20} style={{ color: "var(--primary)" }} />
                    <div>
                      <strong style={{ fontSize: "14px", color: "var(--primary-light)" }}>Shopping Complete! 🎉</strong>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block" }}>
                        All ingredients successfully checked off. Ready to prep clean, delicious meals!
                      </span>
                    </div>
                  </div>
                )}

                {/* Aisle Groups */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {Object.entries(groupedItems).map(([aisle, items]) => (
                    <div 
                      key={aisle} 
                      style={{ 
                        background: "rgba(148, 163, 184, 0.01)", 
                        border: "1px solid var(--border)", 
                        borderRadius: "var(--radius-lg)", 
                        padding: "16px"
                      }}
                    >
                      <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", borderBottom: "1px solid var(--border)", paddingBottom: "6px", marginBottom: "12px" }}>
                        {aisle}
                      </h4>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {items.map((item) => {
                          const originalItemIdx = list.items.findIndex((i) => i.id === item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleItem(item.id, listIdx, originalItemIdx)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                cursor: "pointer",
                                opacity: item.checked ? 0.4 : 1,
                                textDecoration: item.checked ? "line-through" : "none",
                                fontSize: "13px",
                                color: "var(--text-secondary)",
                                transition: "all var(--transition)",
                                padding: "4px 0"
                              }}
                            >
                              {item.checked ? (
                                <CheckSquare size={16} style={{ color: "var(--primary)" }} />
                              ) : (
                                <Square size={16} />
                              )}
                              <span>
                                {item.amount} {item.unit} {item.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
