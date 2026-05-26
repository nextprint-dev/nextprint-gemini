import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, mockupStyle } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    const fullPrompt = `You are a jersey designer. Customer wants: "${prompt}" on a "${mockupStyle}" jersey. Respond ONLY with raw JSON no backticks: {"designDescription":"description","colors":{"primary":"#hexcolor","secondary":"#hexcolor","accent":"#hexcolor","text":"#hexcolor"},"pattern":"solid","teamName":"team name or empty","number":"number or empty","designElements":["el1"]}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:fullPrompt}]}]})});
    if (!response.ok) { const err = await response.json(); throw new Error(err.error?.message || "Gemini API error"); }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = text.replace(/```json|```/g,"").trim();
    const design = JSON.parse(cleaned);
    return NextResponse.json({ success: true, design, mockupStyle });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
