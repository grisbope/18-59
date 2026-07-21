import { NextResponse } from "next/server";
import { loadShareablePlan, saveShareablePlan } from "@/lib/share-plan";
import type { FamilyPlan } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") || "";
  const plan = await loadShareablePlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ plan });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plan = body.plan as FamilyPlan | undefined;
    if (!plan?.id || !plan.before?.items) {
      return NextResponse.json({ error: "plan inválido" }, { status: 400 });
    }
    const saved = await saveShareablePlan(plan);
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(req.url).origin ||
      "https://18-59.grisbope.com";
    const shareUrl = `${origin.replace(/\/$/, "")}/plan/v/${encodeURIComponent(saved.id)}`;
    return NextResponse.json({ id: saved.id, shareUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al compartir" },
      { status: 500 }
    );
  }
}
