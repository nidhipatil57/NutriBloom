"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Leaf } from "lucide-react";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--bg-primary)",
          gap: "20px",
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Leaf size={40} className="float" style={{ color: "var(--primary)" }} />
          <div
            className="spinning"
            style={{
              position: "absolute",
              width: "68px",
              height: "68px",
              border: "3px solid transparent",
              borderTop: "3px solid var(--primary)",
              borderRadius: "50%",
            }}
          />
        </div>
        <h2 style={{ fontSize: "18px", color: "var(--text-secondary)", fontWeight: 500 }}>
          Entering NutriBloom...
        </h2>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
