import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, mockupStyle } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

    const systemPrompt = `You are an expert sportswear designer for nextprint.in. 
The customer describes their jersey design. Return ONLY a valid JSON object:
{
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode"
  },
  "description": "2 sentence design description for the customer"
}
No markdown, no backticks, just raw JSON.`;

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: `Jersey style: ${mockupStyle}. Design idea: "${prompt}"` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      throw new Error(err.error?.message || "Gemini API error");
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

    let design;
    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      design = JSON.parse(cleaned);
    } catch {
      design = {
        colors: { primary: "#1a3a8f", secondary: "#c8a400", accent: "#ffffff" },
        description: "Your custom jersey design with the selected colors."
      };
    }

    return NextResponse.json({
      success: true,
      colors: design.colors,
      refinedPrompt: design.description,
      mockupStyle,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
