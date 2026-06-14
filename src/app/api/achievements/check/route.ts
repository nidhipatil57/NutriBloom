import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkAndAwardAchievements } from "@/lib/achievements";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const newlyUnlocked = await checkAndAwardAchievements(userId);

    return NextResponse.json({ newlyUnlocked });
  } catch (err) {
    console.error("Achievements CHECK error:", err);
    return NextResponse.json({ error: "Failed to run achievements check" }, { status: 500 });
  }
}
