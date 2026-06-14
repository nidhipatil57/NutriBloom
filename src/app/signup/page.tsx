"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useToast, ToastProvider } from "@/components/ToastProvider";

function SignupContent() {
  const router = useRouter();
  const { status } = useSession();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      error("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      error("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        error(data.error || "Failed to create account.");
        setIsLoading(false);
      } else {
        success("Account created successfully! Signing in...");
        // Auto-login after successful signup
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.error) {
          router.push("/login");
        } else {
          router.push("/dashboard?welcome=true");
        }
      }
    } catch (err) {
      console.error(err);
      error("An error occurred during registration.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error(err);
      error("Failed to sign in with Google.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Ambient Orbs */}
      <div
        className="ambient-orb float"
        style={{
          top: "15%",
          left: "8%",
          width: "280px",
          height: "280px",
          background: "var(--primary-glow)",
        }}
      />
      <div
        className="ambient-orb float-delayed"
        style={{
          bottom: "10%",
          right: "42%",
          width: "380px",
          height: "380px",
          background: "rgba(6, 182, 212, 0.08)", // Cyan
        }}
      />

      {/* Left side: Branding/Marketing */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          borderRight: "1px solid var(--border)",
          background: "linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))",
          position: "relative",
        }}
        className="slide-up"
      >
        <div style={{ maxWidth: "520px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
            <Leaf size={32} style={{ color: "var(--primary)" }} />
            <span
              style={{
                fontSize: "24px",
                fontWeight: 800,
                background: "linear-gradient(135deg, var(--text-primary), var(--primary-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NutriBloom
            </span>
          </div>

          <h1 style={{ fontSize: "42px", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-1px", marginBottom: "20px" }}>
            Create your{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--cyan))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              nutrition blueprint
            </span>{" "}
            today.
          </h1>

          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px" }}>
            Establish customized macro targets, map weekly meal logs, generate dynamic grocery lists, and get coached by intelligent AI models. Start for free.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Track calories, macros, and micro-nutrients</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cyan)" }} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Interactive weekly planner & autocomplete templates</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--purple)" }} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Auto-generated grocery lists sorted by supermarket aisles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Signup form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          className="glass-card fade-in"
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "40px 32px",
            background: "rgba(10, 15, 26, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.1)",
          }}
        >
          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>Get Started</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              Create your account in less than a minute
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Name field */}
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  className="input"
                  style={{ paddingLeft: "42px" }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Email field */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className="input"
                  style={{ paddingLeft: "42px" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingLeft: "42px", paddingRight: "42px" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingLeft: "42px" }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", height: "44px", fontSize: "14px", marginTop: "8px" }}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Or Sign Up With
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", gap: "10px", height: "44px" }}
            disabled={isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.84-2.47 2.87v2.38h3.97c2.33-2.14 3.67-5.3 3.67-8.91z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.97-2.38c-1.12.75-2.5 1.21-3.96 1.21-3.05 0-5.63-2.06-6.55-4.83H1.37v2.46C3.36 21.57 7.42 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.45 15.09c-.24-.72-.38-1.5-.38-2.3 0-.79.14-1.57.38-2.3V8.02H1.37C.5 9.77 0 11.83 0 14c0 2.17.5 4.23 1.37 5.98l4.08-2.89z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.42 0 3.36 2.43 1.37 6.02l4.08 2.89c.92-2.77 3.5-4.83 6.55-4.83z"
              />
            </svg>
            <span>Google Workspace</span>
          </button>

          {/* Redirect to Login */}
          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--primary-light)", fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <SessionProvider>
      <ToastProvider>
        <SignupContent />
      </ToastProvider>
    </SessionProvider>
  );
}
