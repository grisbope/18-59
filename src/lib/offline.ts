import type { FamilyPlan } from "./utils";

const PLAN_KEY = "1859-family-plan";
const CACHE_NAME = "1859-offline-v1";

export function savePlanLocal(plan: FamilyPlan) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  void cachePlanForOffline(plan);
}

export function loadPlanLocal(): FamilyPlan | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PLAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FamilyPlan;
  } catch {
    return null;
  }
}

async function cachePlanForOffline(plan: FamilyPlan) {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const body = JSON.stringify(plan);
    await cache.put(
      "/offline-plan.json",
      new Response(body, {
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch {
    // ignore
  }
}

export async function loadPlanFromCache(): Promise<FamilyPlan | null> {
  if (!("caches" in window)) return loadPlanLocal();
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match("/offline-plan.json");
    if (!res) return loadPlanLocal();
    return (await res.json()) as FamilyPlan;
  } catch {
    return loadPlanLocal();
  }
}

export function downloadPlanMarkdown(plan: FamilyPlan) {
  const md = [
    `# Plan de resiliencia familiar — 18:59`,
    ``,
    `**Edificio:** ${plan.buildingName}`,
    `**Sector:** ${plan.sectorName}`,
    `**Riesgo:** ${plan.riskLevel}`,
    `**Amenaza:** ${plan.hazardType}`,
    `**Punto de encuentro:** ${plan.meetingPoint}`,
    `**Ruta:** ${plan.evacuationRoute}`,
    ``,
    `## Resumen`,
    plan.familySummary,
    ``,
    `## Antes`,
    ...plan.before.items.map((i) => `- ${i}`),
    ``,
    `## Durante`,
    ...plan.during.items.map((i) => `- ${i}`),
    ``,
    `## Después`,
    ...plan.after.items.map((i) => `- ${i}`),
    ``,
    `## Fuentes citadas`,
    ...plan.sources.map((s) => `- **${s.title}:** ${s.excerpt}`),
    ``,
    `_Generado ${plan.generatedAt}. No sustituye instrucciones oficiales de gestión de riesgos._`,
  ].join("\n");

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `plan-1859-${plan.buildingId}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Descarga el plan en PDF (cliente). */
export async function downloadPlanPdf(plan: FamilyPlan) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const maxW = 210 - margin * 2;
  let y = 18;

  const line = (text: string, size = 11, gap = 6) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    for (const l of lines) {
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
      doc.text(l, margin, y);
      y += gap;
    }
  };

  doc.setFont("helvetica", "bold");
  line("18:59 — Plan de resiliencia familiar", 16, 8);
  doc.setFont("helvetica", "normal");
  line(`${plan.buildingName}`, 13, 7);
  line(`Sector: ${plan.sectorName} · Riesgo: ${plan.riskLevel} · Amenaza: ${plan.hazardType}`, 10, 6);
  line(`Punto de encuentro: ${plan.meetingPoint}`, 10, 5);
  line(`Ruta: ${plan.evacuationRoute}`, 10, 7);
  line(plan.familySummary, 11, 7);

  for (const section of [plan.before, plan.during, plan.after]) {
    doc.setFont("helvetica", "bold");
    line(section.title, 12, 6);
    doc.setFont("helvetica", "normal");
    section.items.forEach((item, i) => line(`${i + 1}. ${item}`, 10, 5));
    y += 2;
  }

  if (plan.sources?.length) {
    doc.setFont("helvetica", "bold");
    line("Fuentes citadas", 12, 6);
    doc.setFont("helvetica", "normal");
    plan.sources.slice(0, 5).forEach((s) => {
      line(`• ${s.title}: ${s.excerpt}`, 9, 4.5);
    });
  }

  y += 4;
  doc.setFontSize(8);
  doc.setTextColor(100);
  line(
    `Generado ${plan.generatedAt}. No sustituye instrucciones oficiales de gestión de riesgos. 18-59.grisbope.com`,
    8,
    4
  );

  doc.save(`plan-1859-${plan.buildingId}.pdf`);
}

