import { NextResponse } from "next/server";
import { runParkEventAgent, type ParkEventProfile } from "@/lib/parks";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parkId = String(body.parkId || "");
    if (!parkId) {
      return NextResponse.json({ error: "parkId requerido" }, { status: 400 });
    }

    const profile: ParkEventProfile = {
      eventName: String(body.eventName || "Evento comunitario").slice(0, 120),
      eventType: String(body.eventType || "comunitario"),
      attendees: Math.min(Math.max(Number(body.attendees) || 50, 1), 5000),
      hasChildren: Boolean(body.hasChildren),
      hasElderly: Boolean(body.hasElderly),
      hasDisability: Boolean(body.hasDisability),
      durationHours: Math.min(Math.max(Number(body.durationHours) || 3, 1), 24),
      organizerContact: String(body.organizerContact || "").slice(0, 120),
    };

    const visionAnalysis =
      typeof body.visionAnalysis === "string" && body.visionAnalysis.trim()
        ? body.visionAnalysis.trim().slice(0, 4000)
        : undefined;

    const plan = await runParkEventAgent({
      parkId,
      profile,
      visionAnalysis,
    });

    return NextResponse.json({
      plan,
      mode: process.env.OPENAI_API_KEY ? "openai" : "demo",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error plan parque" },
      { status: 500 }
    );
  }
}
