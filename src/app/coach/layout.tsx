"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ToastProvider";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <AuthGuard>
          <div className="app-layout">
            <Sidebar />
            <main className="app-main">
              <TopBar />
              <div className="app-content">{children}</div>
            </main>
          </div>
        </AuthGuard>
      </ToastProvider>
    </SessionProvider>
  );
}
