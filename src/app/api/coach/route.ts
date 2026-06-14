import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    // 1. Fetch user data for the system prompt context
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const goals = await prisma.goal.findUnique({ where: { userId } });
    const prefs = await prisma.userPreference.findUnique({ where: { userId } });

    const todayStr = new Date().toLocaleDateString("en-CA");
    const todayLog = await prisma.nutritionLog.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });

    const waterLog = await prisma.waterLog.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });

    const name = user?.name || "User";
    const calorieTarget = goals?.calorieTarget || 2000;
    const proteinTarget = goals?.proteinTarget || 150;
    const carbTarget = goals?.carbTarget || 250;
    const fatTarget = goals?.fatTarget || 65;
    const dietType = goals?.dietType || "balanced";
    const waterTargetMl = goals?.waterTargetMl || 2500;

    const totalCalories = todayLog?.totalCalories || 0;
    const totalProtein = todayLog?.totalProtein || 0;
    const totalCarbs = todayLog?.totalCarbs || 0;
    const totalFat = todayLog?.totalFat || 0;
    const waterMl = waterLog?.amountMl || 0;

    const calPct = Math.round((totalCalories / calorieTarget) * 100);

    // 2. Compose System Prompt
    const systemPrompt = `You are NutriBloom Coach, a friendly dietary assistant with access to the user's real nutrition data.
    
    USER PROFILE:
    - Name: ${name}
    - Daily goals: ${calorieTarget} cal | ${proteinTarget}g protein | ${carbTarget}g carbs | ${fatTarget}g fat
    - Diet type: ${dietType}
    - Water goal: ${waterTargetMl}ml/day
    
    TODAY (${todayStr}):
    - Calories: ${Math.round(totalCalories)} / ${calorieTarget} kcal (${calPct}% of goal)
    - Protein: ${Math.round(totalProtein)}g / ${proteinTarget}g
    - Carbs: ${Math.round(totalCarbs)}g / ${carbTarget}g
    - Fat: ${Math.round(totalFat)}g / ${fatTarget}g
    - Water: ${waterMl}ml / ${waterTargetMl}ml
    
    Keep responses friendly, supportive, actionable, and under 3-4 sentences. Focus on helping them hit their macronutrient splits and hydration goals. Use emojis occasionally (🌿, 💧, 💪).`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const isApiKeyPlaceholder = !apiKey || apiKey.startsWith("sk-ant-api-placeholder-keys") || !apiKey.startsWith("sk-ant-");

    if (isApiKeyPlaceholder) {
      // ── SMART MOCK COACH RESPONSE FALLBACK ──
      // Delay slightly for realism
      await new Promise((resolve) => setTimeout(resolve, 800));

      const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
      let reply = "";

      if (lastUserMessage.includes("lunch") || lastUserMessage.includes("dinner") || lastUserMessage.includes("eat")) {
        reply = `For a healthy addition matching your ${dietType} diet, I'd suggest a quinoa salad with grilled chicken or chickpeas, seasoned with garlic, lemon juice, and a splash of olive oil! It'll help bump up your protein intake while staying calorie-friendly. 🌿`;
      } else if (lastUserMessage.includes("track") || lastUserMessage.includes("goal") || lastUserMessage.includes("today")) {
        reply = `You've logged ${Math.round(totalCalories)} kcal out of your ${calorieTarget} kcal target today. You're at ${calPct}% of your calorie goal! Remember to drink some water (currently ${waterMl}ml) to keep your hydration up. 💪`;
      } else if (lastUserMessage.includes("snack") || lastUserMessage.includes("protein")) {
        reply = `To hit your ${proteinTarget}g protein goal, try snacking on Greek yogurt with chia seeds, a handful of almonds, or a couple of hard-boiled eggs. These options provide clean protein with healthy fats! 🥩`;
      } else {
        reply = `Hi ${name}! Looking at your logs, you've hit ${calPct}% of your daily calorie target. Let me know if you want meal suggestions, high-protein snack ideas, or tips to hit your weekly targets! 🌿`;
      }

      return NextResponse.json({ reply });
    }

    // ── CALL ANTHROPIC CLAUDE API ──
    const messagesBody = [
      { role: "user", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 400,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        system: systemPrompt,
      }),
    });

    if (response.ok) {
      const resJson = await response.json();
      const reply = resJson.content[0].text;
      return NextResponse.json({ reply });
    } else {
      throw new Error("Claude API request failed");
    }
  } catch (err) {
    console.error("Coach API POST error:", err);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
