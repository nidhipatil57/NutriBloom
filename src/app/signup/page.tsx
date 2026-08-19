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

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email: "demo@nutribloom.com",
        password: "demopassword",
        redirect: false,
      });

      if (res?.error) {
        error("Failed to sign in with demo account.");
      } else {
        success("Signed in successfully as Demo User!");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      error("An unexpected error occurred.");
    } finally {
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

          {/* Demo Login Button */}
          <button
            onClick={handleDemoSignIn}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", height: "44px", fontSize: "14px", marginTop: "16px", border: "1px solid var(--primary)", color: "var(--primary)" }}
            disabled={isLoading}
          >
            <span>Demo Account Login</span>
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
