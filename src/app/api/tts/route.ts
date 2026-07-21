import { NextResponse } from "next/server";
import { getOpenAI, hasOpenAI } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text;
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text requerido" }, { status: 400 });
    }

    if (!hasOpenAI()) {
      return NextResponse.json(
        { error: "TTS OpenAI no configurado; usa Web Speech en cliente", fallback: true },
        { status: 503 }
      );
    }

    const openai = getOpenAI()!;
    const input = text.slice(0, 3500);

    try {
      const speech = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "coral",
        input,
      });
      const buffer = Buffer.from(await speech.arrayBuffer());
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
        },
      });
    } catch {
      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input,
      });
      const buffer = Buffer.from(await speech.arrayBuffer());
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
        },
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error TTS", fallback: true },
      { status: 500 }
    );
  }
}
