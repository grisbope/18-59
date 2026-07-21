import buildingsData from "@/data/buildings.json";
import type { Building, FamilyPlan, FamilyProfile, SectorStat } from "./utils";
import { formatSources, retrieveRAG } from "./rag";
import { getOpenAI, hasOpenAI } from "./openai";
import { getSupabaseAdmin } from "./supabase";

const buildings = buildingsData as Building[];

/** Store demo en memoria para tablero comunitario sin Supabase. */
const demoStats: Record<string, SectorStat> = {
  "centro-historico": {
    sectorId: "centro-historico",
    sectorName: "Centro Histórico",
    totalHouseholds: 420,
    householdsWithPlan: 38,
    percent: 9,
  },
  "san-gregorio": {
    sectorId: "san-gregorio",
    sectorName: "San Gregorio / Plaza Memorial",
    totalHouseholds: 180,
    householdsWithPlan: 22,
    percent: 12,
  },
  picoaza: {
    sectorId: "picoaza",
    sectorName: "Picoazá",
    totalHouseholds: 310,
    householdsWithPlan: 15,
    percent: 5,
  },
  "andre-bello": {
    sectorId: "andre-bello",
    sectorName: "Andrés Bello",
    totalHouseholds: 250,
    householdsWithPlan: 19,
    percent: 8,
  },
  florida: {
    sectorId: "florida",
    sectorName: "Florida",
    totalHouseholds: 200,
    householdsWithPlan: 11,
    percent: 6,
  },
};

function pct(withPlan: number, total: number) {
  return Math.round((withPlan / Math.max(total, 1)) * 100);
}

export function listBuildings(): Building[] {
  return buildings;
}

export function getBuilding(id: string): Building | undefined {
  return buildings.find((b) => b.id === id);
}

export async function getCommunityStats(): Promise<SectorStat[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin
      .from("community_sector_stats")
      .select("*")
      .order("sector_name");
    if (!error && data) {
      return data.map((r) => ({
        sectorId: r.sector_id,
        sectorName: r.sector_name,
        totalHouseholds: r.total_households,
        householdsWithPlan: r.households_with_plan,
        percent: pct(r.households_with_plan, r.total_households),
      }));
    }
  }
  return Object.values(demoStats).map((s) => ({
    ...s,
    percent: pct(s.householdsWithPlan, s.totalHouseholds),
  }));
}

export async function registerSharedPlan(sectorId: string): Promise<SectorStat[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.rpc("register_shared_plan", { p_sector_id: sectorId });
    return getCommunityStats();
  }
  const s = demoStats[sectorId];
  if (s && s.householdsWithPlan < s.totalHouseholds) {
    s.householdsWithPlan += 1;
    s.percent = pct(s.householdsWithPlan, s.totalHouseholds);
  }
  return getCommunityStats();
}

function buildFallbackPlan(
  building: Building,
  profile: FamilyProfile,
  sources: { title: string; excerpt: string }[]
): FamilyPlan {
  const inclusion: string[] = [];
  if (profile.hasElderly)
    inclusion.push("Asignar acompañante a adultos mayores; kit con medicamentos a la mano.");
  if (profile.hasChildren)
    inclusion.push("Practicar el plan con niños; llevar identificación y juguete de calma en el kit.");
  if (profile.hasDisability)
    inclusion.push("Definir ruta accesible y señal acordada; compartir el plan con vecinos de apoyo.");

  const hazard = profile.hazardType;
  const before =
    hazard === "sismo"
      ? [
          "Identificar salidas y el punto de encuentro del edificio.",
          "Preparar kit: agua, linterna, documentos, medicamentos, radio.",
          "Asegurar objetos que puedan caer; acordar roles familiares.",
          ...inclusion,
        ]
      : hazard === "inundacion"
        ? [
            "Conocer rutas a zona alta y cotas locales de inundación.",
            "Elevar documentos y medicamentos; acordar señal de salida temprana.",
            ...inclusion,
          ]
        : [
            "Almacenar agua de forma segura; priorizar usos esenciales.",
            "Vigilar salud de adultos mayores y niños ante estrés hídrico.",
            ...inclusion,
          ];

  const during =
    hazard === "sismo"
      ? [
          "Agáchate, cúbrete y sujétate; lejos de ventanas y cornisas.",
          "No uses ascensores. Evacúa cuando el movimiento cese con calma.",
          "Dirígete al punto de encuentro comunitario.",
        ]
      : hazard === "inundacion"
        ? [
            "No cruces corrientes ni bajo puentes.",
            "Evacúa a zona alta siguiendo la ruta acordada.",
          ]
        : [
            "Aplica el racionamiento familiar acordado.",
            "Prioriza hidratación de personas vulnerables.",
          ];

  const after = [
    "Verifica heridas y ayuda sin ponerte en riesgo.",
    "Corta gas/electricidad si hay indicios de fuga o daño.",
    "No reingreses hasta evaluación de seguridad.",
    "Infórmate solo por canales oficiales.",
  ];

  return {
    id: `plan-${building.id}-${Date.now()}`,
    buildingId: building.id,
    buildingName: building.name,
    sectorId: building.sectorId,
    sectorName: building.sectorName,
    riskLevel: building.riskLevel,
    hazardType: hazard,
    meetingPoint: building.safeMeetingPoint,
    evacuationRoute: building.evacuationNotes,
    before: { title: "Antes", items: before },
    during: { title: "Durante", items: during },
    after: { title: "Después", items: after },
    sources,
    generatedAt: new Date().toISOString(),
    familySummary: `Plan para hogar de ${profile.householdSize} personas en ${building.name} (riesgo ${building.riskLevel}). Tipo de vivienda: ${profile.housingType}.`,
  };
}

/**
 * Agente orquestador 18:59 (patrón Agents SDK):
 * geolocalizar/seleccionar edificio → RAG informe → generar plan → empaquetar → registrar.
 */
export async function runResilienceAgent(input: {
  buildingId: string;
  profile: FamilyProfile;
}): Promise<FamilyPlan> {
  const building = getBuilding(input.buildingId);
  if (!building) throw new Error("Edificio no encontrado");

  const query = [
    `Portoviejo edificio ${building.name} riesgo ${building.riskLevel}`,
    building.vulnerabilities.join(" "),
    `plan familiar ${input.profile.hazardType}`,
    input.profile.hasElderly ? "adultos mayores" : "",
    input.profile.hasChildren ? "niños" : "",
    input.profile.hasDisability ? "discapacidad" : "",
    "SNGR lineamientos evacuación",
  ].join(" ");

  const chunks = await retrieveRAG(query, 5);
  const sources = formatSources(chunks);

  if (!hasOpenAI()) {
    return buildFallbackPlan(building, input.profile, sources);
  }

  const openai = getOpenAI()!;
  const context = chunks.map((c) => `[${c.title}]\n${c.text}`).join("\n\n---\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Eres el agente 18:59 de Portoviejo. Generas planes de resiliencia familiar en español, claros y accionables.
Siempre cita fuentes del contexto RAG. No inventes normas. No digas que sustituyes a autoridades.
Responde SOLO JSON con keys: familySummary, before (string[]), during (string[]), after (string[]), meetingPoint, evacuationRoute.`,
      },
      {
        role: "user",
        content: `Edificio: ${JSON.stringify(building)}
Perfil familiar: ${JSON.stringify(input.profile)}
Contexto RAG (citar):
${context}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: {
    familySummary?: string;
    before?: string[];
    during?: string[];
    after?: string[];
    meetingPoint?: string;
    evacuationRoute?: string;
  };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return buildFallbackPlan(building, input.profile, sources);
  }

  return {
    id: `plan-${building.id}-${Date.now()}`,
    buildingId: building.id,
    buildingName: building.name,
    sectorId: building.sectorId,
    sectorName: building.sectorName,
    riskLevel: building.riskLevel,
    hazardType: input.profile.hazardType,
    meetingPoint: parsed.meetingPoint || building.safeMeetingPoint,
    evacuationRoute: parsed.evacuationRoute || building.evacuationNotes,
    before: { title: "Antes", items: parsed.before?.length ? parsed.before : ["Preparar kit y roles."] },
    during: { title: "Durante", items: parsed.during?.length ? parsed.during : ["Protégete y evacúa con calma."] },
    after: { title: "Después", items: parsed.after?.length ? parsed.after : ["Punto de encuentro y canales oficiales."] },
    sources,
    generatedAt: new Date().toISOString(),
    familySummary:
      parsed.familySummary ||
      `Plan personalizado para ${building.name} — riesgo ${building.riskLevel}.`,
  };
}
