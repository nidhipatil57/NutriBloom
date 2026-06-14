"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Leaf, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const CoachChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your NutriBloom Coach 🌿 I can see your nutrition data and help you reach your goals. What can I help with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSuggestion, setHasSuggestion] = useState(true); // Red indicator
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "What should I eat for lunch?",
    "Am I on track today?",
    "High-protein snack ideas",
    "Review my week",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasSuggestion(false); // Clear suggestion dot once opened
    }
  }, [isOpen, messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg];
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now. Please try again in a bit!" },
        ]);
      }
    } catch (err) {
      console.error("Coach API error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! An error occurred. Let's try again in a moment." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div
        style={{
          position: "fixed",
          bottom: "88px",
          right: "24px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-primary float-delayed pulse-glow"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "1px solid var(--primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            cursor: "pointer",
            boxShadow: "0 8px 32px var(--primary-glow)",
          }}
        >
          <Bot size={24} style={{ color: "#030712" }} />
          {hasSuggestion && !isOpen && (
            <span
              style={{
                position: "absolute",
                top: "0px",
                right: "0px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "var(--danger)",
                border: "2px solid var(--bg-primary)",
                animation: "pulseGlow 1.5s infinite",
              }}
            />
          )}
        </button>
      </div>

      {/* Chat Expandable Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="glass-card"
            style={{
              position: "fixed",
              bottom: "160px",
              right: "24px",
              width: "400px",
              height: "560px",
              display: "flex",
              flexDirection: "column",
              zIndex: 1000,
              boxShadow: "var(--shadow-lg), 0 0 30px rgba(16,185,129,0.1)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(10, 15, 26, 0.8)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--primary-glow)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <Leaf size={16} style={{ color: "var(--primary-light)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    NutriBloom Coach
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }} />
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-ghost btn-icon"
                style={{ width: "30px", height: "30px", padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Body */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                background: "rgba(3, 7, 18, 0.3)",
              }}
            >
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        background: isUser
                          ? "linear-gradient(135deg, var(--primary-dark), var(--primary))"
                          : "var(--bg-elevated)",
                        color: isUser ? "#030712" : "var(--text-primary)",
                        fontWeight: isUser ? 600 : 500,
                        border: isUser ? "none" : "1px solid var(--border)",
                        borderBottomRightRadius: isUser ? "2px" : "var(--radius-md)",
                        borderBottomLeftRadius: isUser ? "var(--radius-md)" : "2px",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {/* Typing Loader */}
              {isLoading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }}
                      className="spinning"
                    />
                    <div
                      style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", animationDelay: "0.2s" }}
                      className="spinning"
                    />
                    <div
                      style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", animationDelay: "0.4s" }}
                      className="spinning"
                    />
                  </div>
                </div>
              )}

              {/* Suggested Pills - Only display if there are no user messages yet */}
              {messages.length === 1 && !isLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Suggested Prompts
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSend(prompt)}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: "var(--radius-full)", fontSize: "12px", padding: "5px 12px" }}
                      >
                        <Sparkles size={11} style={{ color: "var(--primary)" }} />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              style={{
                padding: "12px 16px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: "10px",
                background: "rgba(10, 15, 26, 0.9)",
              }}
            >
              <input
                type="text"
                placeholder="Ask your Coach a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input"
                style={{ height: "40px", border: "1px solid var(--border)" }}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: "40px",
                  height: "40px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-md)",
                }}
                disabled={!input.trim() || isLoading}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CoachChat;
