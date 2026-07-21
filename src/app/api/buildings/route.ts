import { NextResponse } from "next/server";
import { listBuildings, getBuilding } from "@/lib/agents";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const b = getBuilding(id);
    if (!b) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ building: b });
  }
  return NextResponse.json({ buildings: listBuildings() });
}
