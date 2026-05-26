import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { prompt, mockupStyle, mockupImageBase64 } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const fullPrompt = `You are a professional sports jersey designer for NextPrint, an Indian custom jersey manufacturer.

The customer has selected a "${mockupStyle}" jersey style mockup.

Customer's design request: "${prompt}"

Generate a detailed, vivid description of the jersey design AND create an SVG design that would look great on a ${mockupStyle} jersey.

Respond with ONLY a JSON object in this exact format:
{
  "designDescription": "A detailed description of the design for the customer",
  "colors": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor", 
    "accent": "#hexcolor",
    "text": "#hexcolor"
  },
  "pattern": "solid|stripes|gradient|geometric|diagonal",
  "teamName": "extracted team name from prompt or empty string",
  "number": "jersey number if mentioned or empty string",
  "designElements": ["list", "of", "design", "elements"]
}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();
    
    // Clean and parse JSON
    const cleaned = response.replace(/```json|```/g, "").trim();
    const design = JSON.parse(cleaned);

    return NextResponse.json({ 
      success: true, 
      design,
      mockupStyle 
    });

  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate design" },
      { status: 500 }
    );
  }
}
