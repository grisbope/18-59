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
        {
          error: "TTS OpenAI no configurado; usa Web Speech en cliente",
          fallback: true,
        },
        { status: 503 }
      );
    }

    const openai = getOpenAI()!;
    const input = text.slice(0, 3500);

    // tts-1 es más estable y universal (mp3) en móviles
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input,
      response_format: "mp3",
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    if (!buffer.length) {
      return NextResponse.json({ error: "Audio vacío", fallback: true }, { status: 500 });
    }
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error TTS", fallback: true },
      { status: 500 }
    );
  }
}
