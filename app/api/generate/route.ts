import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, mockupStyle } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const geminiKey = process.env.GEMINI_API_KEY;
    const sdKey = process.env.STABLE_DIFFUSION_API_KEY;

    if (!geminiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

    // ── STEP 1: Gemini refines the user prompt into a detailed image prompt ──
    const systemPrompt = `You are an expert AI prompt engineer for a sportswear company called nextprint.in.
The customer has selected a jersey style and described their design idea.
Your job: turn their input into a highly detailed, professional prompt for an AI image generator (Stable Diffusion).
Rules:
- The jersey must be shown as a flat-lay product photograph on a clean white or light grey studio background
- No human models or faces
- Describe colors with precise names (e.g. "royal blue", "neon gold")
- Describe patterns, textures, logos, and placement clearly
- Mention the jersey collar/sleeve type from the mockup style
- Output ONLY the final image prompt — no explanations, no preamble`;

    const userMessage = `Mockup style: ${mockupStyle}. Customer's design idea: "${prompt}"`;

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      throw new Error(err.error?.message || "Gemini API error");
    }

    const geminiData = await geminiRes.json();
    const refinedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || prompt;

    // ── STEP 2: Generate the jersey image using Stable Diffusion ──
    let imageUrl: string | null = null;

    if (sdKey) {
      const sdRes = await fetch("https://stablediffusionapi.com/api/v3/text2img", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: sdKey,
          prompt: refinedPrompt + ", professional product photography, flat lay, studio lighting, sharp details, high resolution",
          negative_prompt: "human, person, face, hands, low quality, blurry, watermark, text, deformed",
          width: "512",
          height: "512",
          samples: "1",
          num_inference_steps: "30",
          guidance_scale: 7.5,
          safety_checker: "no",
          enhance_prompt: "yes",
        }),
      });

      if (sdRes.ok) {
        const sdData = await sdRes.json();
        if (sdData.status === "success" && sdData.output?.[0]) {
          imageUrl = sdData.output[0];
        } else if (sdData.status === "processing") {
          imageUrl = sdData.future_links?.[0] || null;
        }
      }
    }

    return NextResponse.json({
      success: true,
      refinedPrompt,
      imageUrl,
      mockupStyle,
      hasImage: !!imageUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
