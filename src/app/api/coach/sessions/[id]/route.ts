import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    // Check ownership first
    const dbSession = await prisma.chatSession.findUnique({
      where: { id },
    });

    if (!dbSession || dbSession.userId !== userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.chatSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/coach/sessions/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;
    const { title } = await req.json();

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Check ownership first
    const dbSession = await prisma.chatSession.findUnique({
      where: { id },
    });

    if (!dbSession || dbSession.userId !== userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updatedSession = await prisma.chatSession.update({
      where: { id },
      data: { title: title.trim() },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (err) {
    console.error("PATCH /api/coach/sessions/[id] error:", err);
    return NextResponse.json({ error: "Failed to rename session" }, { status: 500 });
  }
}
