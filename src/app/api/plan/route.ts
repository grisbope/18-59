import { NextResponse } from "next/server";
import { runResilienceAgent } from "@/lib/agents";
import type { FamilyProfile, HazardType } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const buildingId = String(body.buildingId || "");
    if (!buildingId) {
      return NextResponse.json({ error: "buildingId requerido" }, { status: 400 });
    }
    const profile: FamilyProfile = {
      householdSize: Number(body.householdSize) || 3,
      housingType: String(body.housingType || "departamento"),
      hasElderly: Boolean(body.hasElderly),
      hasChildren: Boolean(body.hasChildren),
      hasDisability: Boolean(body.hasDisability),
      hazardType: (["sismo", "inundacion", "sequia"].includes(body.hazardType)
        ? body.hazardType
        : "sismo") as HazardType,
    };

    const visionAnalysis =
      typeof body.visionAnalysis === "string" && body.visionAnalysis.trim()
        ? body.visionAnalysis.trim().slice(0, 4000)
        : undefined;

    const plan = await runResilienceAgent({
      buildingId,
      profile,
      visionAnalysis,
    });
    return NextResponse.json({
      plan,
      mode: process.env.OPENAI_API_KEY ? "openai" : "demo",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error generando plan" },
      { status: 500 }
    );
  }
}
