import { NextResponse } from "next/server";
import { listParks } from "@/lib/parks";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ parks: listParks() });
}
