"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession, SessionProvider } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff, Sparkles, Lock, Mail } from "lucide-react";
import { useToast, ToastProvider } from "@/components/ToastProvider";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Display error if redirected with auth errors
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam === "CredentialsSignin") {
      error("Invalid email or password. Please try again.");
    } else if (errorParam) {
      error(`Sign in failed: ${errorParam}`);
    }
  }, [searchParams, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please fill in all fields.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        error("Invalid email or password.");
      } else {
        success("Successfully signed in!");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      error("An unexpected error occurred.");
    } finally {
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
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          background: "var(--primary-glow)",
        }}
      />
      <div
        className="ambient-orb float-delayed"
        style={{
          bottom: "15%",
          right: "40%",
          width: "400px",
          height: "400px",
          background: "rgba(139, 92, 246, 0.08)", // Purple
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
            Unlock your body's{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--cyan))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              true intelligence
            </span>
            .
          </h1>

          <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px" }}>
            Track nutrients dynamically, plan meals with AI autopilot, correlate nutrition with mood, and coach yourself with personalized algorithms. All beautifully simplified.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>AI-powered dietary assistant and meal analyzer</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cyan)" }} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Interactive dashboards and mood charts</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--purple)" }} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Achievement engine with smart badges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
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
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>Welcome Back</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              Sign in to manage your nutrition profile
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="input-label">Password</label>
              </div>
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

            {/* Sign In Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", height: "44px", fontSize: "14px" }}
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In with Email"}
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

          {/* Redirect to Signup */}
          <div style={{ marginTop: "32px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "var(--primary-light)", fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <ToastProvider>
        <Suspense fallback={
          <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
            <div className="skeleton" style={{ width: "420px", height: "500px" }} />
          </div>
        }>
          <LoginContent />
        </Suspense>
      </ToastProvider>
    </SessionProvider>
  );
}
