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
  createdAt?: string | Date;
  updatedAt?: string | Date;
  messages: Message[];
}

export default function FullCoachPage() {
  const { error } = useToast();
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeMessages = activeSession?.messages || [];
  const activeTitle = activeSession?.title || "New AI Coaching Session";

  const formatTimestamp = (dateStr?: string | Date) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch sessions from the backend DB on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await fetch("/api/coach/sessions");
        if (res.ok) {
          const data = await res.json();
          if (data.sessions && data.sessions.length > 0) {
            setSessions(data.sessions);
            setActiveSessionId(data.sessions[0].id);
          } else {
            // Automatically create a default session in DB if none exist
            const createRes = await fetch("/api/coach/sessions", { method: "POST" });
            if (createRes.ok) {
              const createData = await createRes.json();
              setSessions([createData.session]);
              setActiveSessionId(createData.session.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load chat sessions:", err);
      } finally {
        setIsPageLoading(false);
      }
    };

    loadSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading || !activeSessionId) return;

    // Create user message
    const userMsg: Message = { role: "user", content: text };
    
    // Update active session messages locally
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const updatedTitle = s.title === "New AI Coaching Session"
            ? (text.length > 30 ? text.substring(0, 27) + "..." : text)
            : s.title;
          return {
            ...s,
            title: updatedTitle,
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...activeMessages, userMsg];
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId: activeSessionId,
          messages: chatHistory 
        }),
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

  const handleCreateNewSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/coach/sessions", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setSessions((prev) => [data.session, ...prev]);
        setActiveSessionId(data.session.id);
      } else {
        error("Failed to create new session.");
      }
    } catch (err) {
      console.error(err);
      error("Failed to create new session.");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "Am I hitting my targets today?",
    "Show me high-protein breakfast ideas",
    "Analyze my calorie consistency",
    "What cuisines match my preferences?"
  ];

  if (isPageLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - var(--topbar-height) - 48px)" }} className="fade-in">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div className="spinning" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid var(--primary)", borderTopColor: "transparent" }} />
          <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>Syncing AI Coach History...</span>
        </div>
      </div>
    );
  }

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
          disabled={isLoading}
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
                  <span>{formatTimestamp(session.updatedAt || session.createdAt)}</span>
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
              <h3 style={{ fontSize: "14px", fontWeight: 800 }}>{activeTitle}</h3>
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
          {activeMessages.map((msg, idx) => {
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
          {activeMessages.length === 1 && !isLoading && (
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
            disabled={!input.trim() || isLoading || !activeSessionId}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}
