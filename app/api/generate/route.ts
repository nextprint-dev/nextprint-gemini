import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, mockupStyle } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

    const systemPrompt = `You are an expert AI prompt engineer for a sportswear company called nextprint.in. Turn the customer's jersey style and design idea into a detailed image prompt. Output ONLY the prompt, no explanations. The jersey must be flat-lay on white background, no humans or faces.`;

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
    const refinedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || prompt;

    // Use Pollinations AI - completely free, no API key needed
    const encodedPrompt = encodeURIComponent(refinedPrompt + ", sportswear, flat lay, white background, product photography");
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Date.now()}`;

    return NextResponse.json({
      success: true,
      refinedPrompt,
      imageUrl,
      mockupStyle,
      hasImage: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
