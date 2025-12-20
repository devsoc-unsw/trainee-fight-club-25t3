import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { metrics } = await req.json();

    // 1. Safety & Config Check
    if (!metrics || !metrics.category_summary) {
      return NextResponse.json({ tip: "Track more expenses to get tips!" });
    }

    if (!process.env.PPLX_API_KEY) {
      console.error("Missing PPLX_API_KEY");
      return NextResponse.json(
        { error: "Server config error: Missing API Key" }, 
        { status: 500 }
      );
    }

    // 2. Construct the prompt
    const topCategories = metrics.category_summary
      .slice(0, 3)
      .map((c: any) => `${c.category} ($${c.spent})`)
      .join(", ");

    const prompt = `
      Act as a friendly but direct financial advisor.
      Here is my monthly financial summary:
      - Total Spent: $${metrics.total_spent}
      - Net Cash Flow: $${metrics.net_cash_flow}
      - Top Expenses: ${topCategories}
      
      Based on this, give me exactly ONE specific, actionable "Tip of the Day" to improve my financial health. 
      Keep it under 30 words. Be encouraging but realistic. Do not use markdown formatting and do not include references 
      at the end of messages (i.e. do not include [1][2] etc.).
    `;

    // 3. Prepare Payload for Perplexity
    const payload = {
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial assistant."
        },
        {
          role: "user",
          content: prompt
        },
      ],
      // Optional: limit tokens or temperature if needed
      temperature: 0.7, 
    };

    // 4. Call Perplexity API
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PPLX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Perplexity API Error:", errText);
      throw new Error(`API Error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    
    // Perplexity follows the OpenAI response schema
    const tip = data.choices[0]?.message?.content || "No tip generated.";

    return NextResponse.json({ tip });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate tip" }, 
      { status: 500 }
    );
  }
}