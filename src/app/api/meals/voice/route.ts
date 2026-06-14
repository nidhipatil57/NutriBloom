import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transcript } = await req.json();
    if (!transcript) {
      return NextResponse.json({ error: "Missing transcript" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyPlaceholder = !apiKey || apiKey.startsWith("gemini-placeholder") || (!apiKey.startsWith("AIzaSy") && !apiKey.startsWith("AQ."));

    if (isApiKeyPlaceholder) {
      // ── LOCAL REGEX KEYWORD MATCHER FALLBACK ──
      const lower = transcript.toLowerCase();
      let name = "Voice Logged Food";
      let calories = 300;
      let protein = 12;
      let carbs = 40;
      let fat = 8;

      if (lower.includes("banana")) {
        name = "Bananas";
        calories = 200;
        protein = 2;
        carbs = 50;
        fat = 0.5;
      } else if (lower.includes("egg") || lower.includes("omelet")) {
        name = "Eggs & Toast";
        calories = 340;
        protein = 18;
        carbs = 24;
        fat = 16;
      } else if (lower.includes("chicken") || lower.includes("rice")) {
        name = "Chicken Fried Rice";
        calories = 550;
        protein = 28;
        carbs = 68;
        fat = 15;
      } else if (lower.includes("shake") || lower.includes("protein")) {
        name = "Protein Shake";
        calories = 220;
        protein = 30;
        carbs = 8;
        fat = 3;
      } else if (lower.includes("apple") || lower.includes("fruit")) {
        name = "Fresh Apple";
        calories = 95;
        protein = 0.5;
        carbs = 25;
        fat = 0.3;
      } else {
        // Echo transcript name
        name = transcript.charAt(0).toUpperCase() + transcript.slice(1);
      }

      return NextResponse.json({ name, calories, protein, carbs, fat });
    }

    // ── CALL GOOGLE GEMINI API (Gemini 2.5 Flash) ──
    const systemPrompt = `You are a nutrition extraction assistant. Given a user's spoken description of what they ate, 
    extract the meal information. Return ONLY a JSON object:
    { "name": string, "calories": number, "protein": number, "carbs": number, "fat": number }
    Base estimates on standard serving sizes. If unclear, estimate conservatively.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Input: "${transcript}"` }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (response.ok) {
      const resJson = await response.json();
      const textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "";
      const cleanJson = textResponse.replace(/^```json/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      return NextResponse.json(parsed);
    } else {
      throw new Error("Gemini API request failed");
    }
  } catch (err) {
    console.error("Voice Log API error:", err);
    return NextResponse.json({ error: "Failed to extract voice details" }, { status: 500 });
  }
}
