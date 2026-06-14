"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ToastProvider";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import CoachChat from "@/components/CoachChat";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
            <CoachChat />
          </div>
        </AuthGuard>
      </ToastProvider>
    </SessionProvider>
  );
}
