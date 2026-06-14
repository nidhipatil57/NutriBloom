import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64 data" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyPlaceholder = !apiKey || apiKey.startsWith("gemini-placeholder") || (!apiKey.startsWith("AIzaSy") && !apiKey.startsWith("AQ."));

    if (isApiKeyPlaceholder) {
      // ── SMART MOCK MEAL ANALYSIS FALLBACK ──
      // Artificial delay to simulate Claude network scan
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResult = {
        name: "Avocado Toast with Poached Eggs 🥑",
        confidence: "high",
        calories: 420,
        protein: 18,
        carbs: 35,
        fat: 22,
        fiber: 6,
        notes: "Calculated based on 2 slices of sourdough, 1/2 mashed avocado, and 2 medium poached eggs.",
      };

      return NextResponse.json(mockResult);
    }

    // ── CALL GOOGLE GEMINI VISION API ──
    // Strip headers out of base64 if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: base64Data,
                },
              },
              {
                text: `Analyze this meal photo. Return ONLY a JSON object:
{
  "name": "specific meal description",
  "confidence": "low"|"medium"|"high",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "notes": "brief note about assumptions"
}
All nutrients in grams (calories in kcal), for the full meal shown.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (response.ok) {
      const resJson = await response.json();
      const textResponse = resJson.candidates[0].content.parts[0].text.trim();
      const parsedResult = JSON.parse(textResponse);
      return NextResponse.json(parsedResult);
    } else {
      const errText = await response.text();
      console.error("Gemini Vision error response:", errText);
      throw new Error("Gemini Vision API request failed");
    }
  } catch (err) {
    console.error("Meal analysis API POST error:", err);
    return NextResponse.json({ error: "Failed to analyze meal image" }, { status: 500 });
  }
}
