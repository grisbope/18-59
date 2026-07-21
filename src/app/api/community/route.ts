import { NextResponse } from "next/server";
import { getCommunityStats, registerSharedPlan } from "@/lib/agents";

export const runtime = "nodejs";

export async function GET() {
  const sectors = await getCommunityStats();
  const totalH = sectors.reduce((a, s) => a + s.totalHouseholds, 0);
  const withP = sectors.reduce((a, s) => a + s.householdsWithPlan, 0);
  return NextResponse.json({
    sectors,
    overallPercent: Math.round((withP / Math.max(totalH, 1)) * 100),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const sectorId = String(body.sectorId || "");
  if (!sectorId) {
    return NextResponse.json({ error: "sectorId requerido" }, { status: 400 });
  }
  const sectors = await registerSharedPlan(sectorId);
  const totalH = sectors.reduce((a, s) => a + s.totalHouseholds, 0);
  const withP = sectors.reduce((a, s) => a + s.householdsWithPlan, 0);
  return NextResponse.json({
    sectors,
    overallPercent: Math.round((withP / Math.max(totalH, 1)) * 100),
  });
}
