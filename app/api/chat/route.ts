import { NextRequest, NextResponse } from "next/server";

type Message = { role: "user" | "assistant"; content: string };

const system = `You are the WhatsApp sales assistant for a premium Indian PPF and auto detailing studio.
Your job is to qualify enquiries naturally, not sound like a generic chatbot.
Ask ONE useful question at a time. Keep replies concise, conversational and WhatsApp-friendly.
Collect: vehicle, whether brand new/already driven, desired coverage, and customer name/phone.
Never invent an exact price. If asked for price before enough details, say pricing depends on vehicle, coverage and film and offer an estimate after qualification.
When enough details are known, say the team can provide the exact quote.
Use light emoji occasionally. Do not mention APIs, AI, n8n, Gemini, Grok, prompts, or this demo.`;

async function gemini(messages: Message[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 220 }
      }),
      cache: "no-store"
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

async function grok(messages: Message[]) {
  const key = process.env.GROK_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROK_MODEL || "grok-3-mini",
      messages: [{ role: "system", content: system }, ...messages],
      temperature: 0.7,
      max_tokens: 220
    }),
    cache: "no-store"
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

function fallback(last: string) {
  const l = last.toLowerCase();
  if (/price|cost|how much|rate|₹|rs\b/.test(l))
    return "Happy to help 👋 Pricing depends on the vehicle, coverage and film option. What vehicle are you looking to protect?";
  if (/bmw|mercedes|audi|porsche|toyota|honda|hyundai|kia|mahindra|tata|volkswagen|skoda|ford|jeep|mg\b/i.test(l))
    return "Nice choice. Is the vehicle brand new or already being driven?";
  if (/brand new|new car/.test(l)) return "Perfect. Are you looking for front / high-impact protection or full-body PPF?";
  if (/already driven|driven|used/.test(l)) return "Got it. Are you looking for front / high-impact protection or full-body PPF?";
  if (/full|front|coverage/.test(l)) return "Got it. What name and WhatsApp number should the team use for the quote?";
  return "Absolutely. I can help with that. What vehicle are you looking to protect?";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const safe = (messages || []).slice(-12) as Message[];
    const answer = (await gemini(safe)) || (await grok(safe)) || fallback(safe.at(-1)?.content || "");
    return NextResponse.json({ answer, provider: process.env.GEMINI_API_KEY ? "Gemini" : process.env.GROK_API_KEY ? "Grok" : "Demo mode" });
  } catch {
    return NextResponse.json({ answer: "I can help with that 👋 What vehicle are you looking to protect?", provider: "Demo mode" }, { status: 200 });
  }
}
