import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const chatSessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ sessions: chatSessions });
  } catch (err) {
    console.error("GET /api/coach/sessions error:", err);
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const newSession = await prisma.chatSession.create({
      data: {
        userId,
        title: "New AI Coaching Session",
        messages: {
          create: {
            role: "assistant",
            content: "Welcome to a fresh coaching log! I'm ready to evaluate your nutrition stats and answer fitness questions. How can I help you bloom?",
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ session: newSession });
  } catch (err) {
    console.error("POST /api/coach/sessions error:", err);
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
  }
}
