"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Leaf, 
  Sparkles, 
  MessageSquare, 
  Plus, 
  User, 
  Clock,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

export default function FullCoachPage() {
  const { error } = useToast();
  
  // Mock Chat Sessions history list
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "session-1",
      title: "Nutrition Audit",
      timestamp: "Today, 10:14 AM",
      messages: [
        {
          role: "assistant",
          content: "Hi! I'm your NutriBloom Coach 🌿 I have compiled your settings and logged foods. Let's audit your targets and get you back on track!",
        },
      ],
    },
    {
      id: "session-2",
      title: "Protein Optimization",
      timestamp: "Yesterday, 2:40 PM",
      messages: [
        {
          role: "assistant",
          content: "Increasing your protein intake can help preserve muscle and optimize recovery. Would you like to review some high-protein breakfast recommendations?",
        },
        {
          role: "user",
          content: "Yes please. Show me a quick meal prep idea.",
        },
        {
          role: "assistant",
          content: "A Greek Yogurt Parfait or a Berry Protein Smoothie is perfect. Both yield over 30g of protein and can be prepped in under 5 minutes!",
        },
      ],
    },
    {
      id: "session-3",
      title: "Hydration Strategy",
      timestamp: "June 12, 11:05 AM",
      messages: [
        {
          role: "assistant",
          content: "Water is the catalyst of metabolism. Let's set some reminders to make sure you exceed your 2500ml target today.",
        },
      ],
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState("session-1");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession.messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Create user message
    const userMsg: Message = { role: "user", content: text };
    
    // Update active session messages locally
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...activeSession.messages, userMsg];
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = { role: "assistant", content: data.reply };
        
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, assistantMsg],
              };
            }
            return s;
          })
        );
      } else {
        error("Coach failed to respond.");
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [
                  ...s.messages,
                  { role: "assistant", content: "I'm having trouble resolving database insights right now. Please try again." },
                ],
              };
            }
            return s;
          })
        );
      }
    } catch (err) {
      console.error(err);
      error("Error communicating with AI coach.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = () => {
    const id = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: "New AI Coaching Session",
      timestamp: "Just now",
      messages: [
        {
          role: "assistant",
          content: "Welcome to a fresh coaching log! I'm ready to evaluate your nutrition stats and answer fitness questions. How can I help you bloom?",
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
  };

  const suggestedPrompts = [
    "Am I hitting my targets today?",
    "Show me high-protein breakfast ideas",
    "Analyze my calorie consistency",
    "What cuisines match my preferences?"
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", height: "calc(100vh - var(--topbar-height) - 48px)" }} className="fade-in">
      
      {/* Left Sidebar: Session Logs History */}
      <div 
        className="glass-card" 
        style={{ 
          padding: "16px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "16px",
          height: "100%",
          overflowY: "auto"
        }}
      >
        <button
          onClick={handleCreateNewSession}
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", gap: "8px" }}
        >
          <Plus size={16} />
          <span>New Session</span>
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", paddingLeft: "4px" }}>
            Recent Discussions
          </span>

          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "4px",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: isActive ? "1px solid var(--primary)" : "1px solid var(--border)",
                  background: isActive ? "var(--primary-glow)" : "rgba(15, 23, 42, 0.2)",
                  color: isActive ? "var(--primary-light)" : "var(--text-secondary)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all var(--transition)",
                  width: "100%"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                  <MessageSquare size={14} style={{ color: isActive ? "var(--primary)" : "var(--text-muted)" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {session.title}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "10px", paddingLeft: "22px" }}>
                  <Clock size={10} />
                  <span>{session.timestamp}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Box: Chat Interface Thread */}
      <div 
        className="glass-card" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "100%", 
          overflow: "hidden" 
        }}
      >
        {/* Chat Window Top Bar */}
        <div 
          style={{ 
            padding: "16px 24px", 
            borderBottom: "1px solid var(--border)", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            background: "rgba(10, 15, 26, 0.4)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-glow)", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={18} style={{ color: "var(--primary-light)" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800 }}>{activeSession.title}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 8px var(--primary)" }} />
                <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Interactive Coaching Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Body Scroll */}
        <div 
          style={{ 
            flex: 1, 
            padding: "24px", 
            overflowY: "auto", 
            display: "flex", 
            flexDirection: "column", 
            gap: "20px",
            background: "rgba(3, 7, 18, 0.15)"
          }}
        >
          {activeSession.messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  justifyContent: isUser ? "flex-end" : "flex-start", 
                  width: "100%",
                  gap: "12px"
                }}
              >
                {!isUser && (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={15} style={{ color: "var(--primary)" }} />
                  </div>
                )}
                
                <div 
                  style={{ 
                    background: isUser 
                      ? "linear-gradient(135deg, var(--primary-dark), var(--primary))" 
                      : "var(--bg-card)",
                    color: isUser ? "#030712" : "var(--text-primary)",
                    border: isUser ? "none" : "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    borderTopRightRadius: isUser ? "2px" : "var(--radius-lg)",
                    borderTopLeftRadius: isUser ? "var(--radius-lg)" : "2px",
                    padding: "14px 18px",
                    maxWidth: "70%",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    fontWeight: isUser ? 600 : 500
                  }}
                >
                  <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
                </div>

                {isUser && (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--bg-elevated), var(--primary-glow))", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={14} style={{ color: "var(--primary-light)" }} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={15} style={{ color: "var(--primary)" }} />
              </div>
              <div 
                style={{ 
                  background: "var(--bg-card)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius-lg)", 
                  borderTopLeftRadius: "2px",
                  padding: "14px 18px",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center"
                }}
              >
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }} className="spinning" />
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", animationDelay: "0.2s" }} className="spinning" />
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", animationDelay: "0.4s" }} className="spinning" />
              </div>
            </div>
          )}

          {/* Suggestion prompt pills */}
          {activeSession.messages.length === 1 && !isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px", paddingLeft: "44px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Suggested Prompts
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: "var(--radius-full)", fontSize: "12px" }}
                  >
                    <Sparkles size={12} style={{ color: "var(--primary)" }} />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
          style={{ 
            padding: "16px 24px", 
            borderTop: "1px solid var(--border)", 
            display: "flex", 
            gap: "12px",
            background: "rgba(10, 15, 26, 0.6)"
          }}
        >
          <input
            type="text"
            placeholder="Ask your coach anything about macro deviations or grocery prep..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input"
            style={{ height: "46px" }}
            disabled={isLoading}
          />
          
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "46px", height: "46px", padding: 0, justifyContent: "center", borderRadius: "var(--radius-md)" }}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}
