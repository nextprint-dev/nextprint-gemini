import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, mockupStyle } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const geminiKey = process.env.GEMINI_API_KEY;
    const sdKey = process.env.STABLE_DIFFUSION_API_KEY;

    if (!geminiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

    const systemPrompt = `You are an expert AI prompt engineer for a sportswear company called nextprint.in. Turn the customer's jersey style and design idea into a detailed Stable Diffusion image prompt. Output ONLY the prompt, no explanations. The jersey must be flat-lay on white background, no humans or faces.`;

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: `Jersey style: ${mockupStyle}. Design idea: "${prompt}"` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      throw new Error(err.error?.message || "Gemini API error");
    }

    const geminiData = await geminiRes.json();
    const refinedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || prompt;

    let imageUrl: string | null = null;

    if (sdKey) {
      try {
        const sdRes = await fetch("https://stablediffusionapi.com/api/v3/text2img", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: sdKey,
            prompt: refinedPrompt + ", professional product photography, flat lay, studio lighting, high resolution",
            negative_prompt: "human, person, face, hands, low quality, blurry, watermark, deformed",
            width: "512",
            height: "512",
            samples: "1",
            num_inference_steps: "30",
            guidance_scale: 7.5,
            safety_checker: "no",
            enhance_prompt: "yes",
          }),
        });
        const sdData = await sdRes.json();
        if (sdData.status === "success" && sdData.output?.[0]) {
          imageUrl = sdData.output[0];
        } else if (sdData.status === "processing" && sdData.future_links?.[0]) {
          imageUrl = sdData.future_links[0];
        }
      } catch (sdError) {
        console.error("SD error:", sdError);
      }
    }

    return NextResponse.json({
      success: true,
      refinedPrompt,
      imageUrl,
      mockupStyle,
      hasImage: !!imageUrl,
      sdKeyPresent: !!sdKey,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
