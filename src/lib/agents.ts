import buildingsData from "@/data/buildings.json";
import type { Building, FamilyPlan, FamilyProfile, SectorStat } from "./utils";
import { formatSources, retrieveRAG } from "./rag";
import { getOpenAI, hasOpenAI } from "./openai";
import { stripMarkdown } from "./text";
import {
  getSupabaseAdmin,
  hasSupabase,
  STATS_OBJECT,
  STORAGE_BUCKET,
} from "./supabase";

const buildings = buildingsData as Building[];

const seedStats: SectorStat[] = [
  {
    sectorId: "centro-historico",
    sectorName: "Centro Histórico",
    totalHouseholds: 420,
    householdsWithPlan: 38,
    percent: 9,
  },
  {
    sectorId: "san-gregorio",
    sectorName: "San Gregorio / Plaza Memorial",
    totalHouseholds: 180,
    householdsWithPlan: 22,
    percent: 12,
  },
  {
    sectorId: "picoaza",
    sectorName: "Picoazá",
    totalHouseholds: 310,
    householdsWithPlan: 15,
    percent: 5,
  },
  {
    sectorId: "andre-bello",
    sectorName: "Andrés Bello",
    totalHouseholds: 250,
    householdsWithPlan: 19,
    percent: 8,
  },
  {
    sectorId: "florida",
    sectorName: "Florida",
    totalHouseholds: 200,
    householdsWithPlan: 11,
    percent: 6,
  },
];

/** Fallback en memoria solo si Supabase no está configurado. */
const demoStats: Record<string, SectorStat> = Object.fromEntries(
  seedStats.map((s) => [s.sectorId, { ...s }])
);

function pct(withPlan: number, total: number) {
  return Math.round((withPlan / Math.max(total, 1)) * 100);
}

function normalizeStats(rows: SectorStat[]): SectorStat[] {
  return rows.map((s) => ({
    ...s,
    percent: pct(s.householdsWithPlan, s.totalHouseholds),
  }));
}

async function readStatsFromStorage(): Promise<SectorStat[] | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .download(STATS_OBJECT);
  if (error || !data) return null;
  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as SectorStat[];
    if (!Array.isArray(parsed) || !parsed.length) return null;
    return normalizeStats(parsed);
  } catch {
    return null;
  }
}

async function writeStatsToStorage(stats: SectorStat[]): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const body = JSON.stringify(normalizeStats(stats), null, 2);
  const { error } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(STATS_OBJECT, body, {
      contentType: "application/json",
      upsert: true,
    });
  return !error;
}

async function ensureStorageSeed(): Promise<SectorStat[]> {
  const existing = await readStatsFromStorage();
  if (existing) return existing;
  const seeded = normalizeStats(seedStats.map((s) => ({ ...s })));
  await writeStatsToStorage(seeded);
  return seeded;
}

export function listBuildings(): Building[] {
  return buildings;
}

export function getBuilding(id: string): Building | undefined {
  return buildings.find((b) => b.id === id);
}

function isBuildingLike(v: unknown): v is Building {
  if (!v || typeof v !== "object") return false;
  const b = v as Record<string, unknown>;
  return (
    typeof b.id === "string" &&
    typeof b.name === "string" &&
    typeof b.address === "string" &&
    typeof b.sectorId === "string" &&
    typeof b.sectorName === "string" &&
    typeof b.lat === "number" &&
    typeof b.lng === "number" &&
    typeof b.riskLevel === "string" &&
    Array.isArray(b.vulnerabilities)
  );
}

export function resolveBuilding(
  buildingId: string,
  customBuilding?: unknown
): Building | undefined {
  if (customBuilding && isBuildingLike(customBuilding)) {
    const base = getBuilding(customBuilding.id);
    if (base) return base;
    // Ubicación real: completar campos faltantes desde el perfil más cercano
    const near =
      buildings.find((b) => b.sectorId === customBuilding.sectorId) ||
      buildings[0];
    return {
      ...near,
      ...customBuilding,
      vulnerabilities:
        customBuilding.vulnerabilities?.length > 0
          ? customBuilding.vulnerabilities.map(String)
          : near.vulnerabilities,
      riskLevel: (["alto", "medio", "bajo"].includes(
        String(customBuilding.riskLevel)
      )
        ? customBuilding.riskLevel
        : near.riskLevel) as Building["riskLevel"],
    };
  }
  return getBuilding(buildingId);
}

export async function getCommunityStats(): Promise<SectorStat[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    // 1) Postgres (si el schema SQL ya se aplicó)
    const { data, error } = await admin
      .from("community_sector_stats")
      .select("*")
      .order("sector_name");
    if (!error && data?.length) {
      return data.map((r) => ({
        sectorId: r.sector_id,
        sectorName: r.sector_name,
        totalHouseholds: r.total_households,
        householdsWithPlan: r.households_with_plan,
        percent: pct(r.households_with_plan, r.total_households),
      }));
    }
    // 2) Storage (vinculación activa con claves sb_*)
    const fromStorage = await ensureStorageSeed();
    if (fromStorage.length) return fromStorage;
  }
  return normalizeStats(Object.values(demoStats).map((s) => ({ ...s })));
}

export async function registerSharedPlan(
  sectorId: string,
  plan?: FamilyPlan | null,
  userId?: string | null
): Promise<SectorStat[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    // Guardar plan agregado (sin PII de ubicación/foto) en Storage
    if (plan) {
      const safe = {
        id: plan.id,
        buildingId: plan.buildingId,
        sectorId: plan.sectorId,
        sectorName: plan.sectorName,
        riskLevel: plan.riskLevel,
        hazardType: plan.hazardType,
        generatedAt: plan.generatedAt,
        shared: true,
        userId: userId || null,
      };
      await admin.storage
        .from(STORAGE_BUCKET)
        .upload(`plans/${plan.id}.json`, JSON.stringify(safe, null, 2), {
          contentType: "application/json",
          upsert: true,
        });
    }

    // Postgres RPC si existe
    const { error: rpcError } = await admin.rpc("register_shared_plan", {
      p_sector_id: sectorId,
    });
    if (!rpcError) {
      return getCommunityStats();
    }

    // Storage: incrementar agregado por sector
    const stats = await ensureStorageSeed();
    const next = stats.map((s) => {
      if (s.sectorId !== sectorId) return s;
      const householdsWithPlan = Math.min(
        s.householdsWithPlan + 1,
        s.totalHouseholds
      );
      return {
        ...s,
        householdsWithPlan,
        percent: pct(householdsWithPlan, s.totalHouseholds),
      };
    });
    await writeStatsToStorage(next);
    return next;
  }

  const s = demoStats[sectorId];
  if (s && s.householdsWithPlan < s.totalHouseholds) {
    s.householdsWithPlan += 1;
    s.percent = pct(s.householdsWithPlan, s.totalHouseholds);
  }
  return getCommunityStats();
}

export function supabaseLinkStatus() {
  return {
    configured: hasSupabase(),
    url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishable: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    secret: Boolean(
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
  };
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
  visionAnalysis?: string;
  customBuilding?: unknown;
}): Promise<FamilyPlan> {
  const building = resolveBuilding(input.buildingId, input.customBuilding);
  if (!building) throw new Error("Edificio no encontrado");

  const query = [
    `Portoviejo edificio ${building.name} riesgo ${building.riskLevel}`,
    building.vulnerabilities.join(" "),
    `plan familiar ${input.profile.hazardType}`,
    input.profile.hasElderly ? "adultos mayores" : "",
    input.profile.hasChildren ? "niños" : "",
    input.profile.hasDisability ? "discapacidad" : "",
    input.visionAnalysis
      ? "fachada interior entorno visual vulnerabilidad"
      : "",
    "SNGR lineamientos evacuación",
  ].join(" ");

  const chunks = await retrieveRAG(query, 5);
  const sources = formatSources(chunks);

  if (!hasOpenAI()) {
    return buildFallbackPlan(building, input.profile, sources);
  }

  const openai = getOpenAI()!;
  const context = chunks.map((c) => `[${c.title}]\n${c.text}`).join("\n\n---\n\n");
  const visionBlock = input.visionAnalysis
    ? `\nAnálisis visual de la vivienda (usar para personalizar el plan, sin alarmismo):\n${input.visionAnalysis}\n`
    : "";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Eres el agente 18:59 de Portoviejo. Generas planes de resiliencia familiar en español, claros y accionables.
Siempre cita fuentes del contexto RAG. No inventes normas. No digas que sustituyes a autoridades.
Si hay análisis visual, incorpóralo en familySummary y en acciones concretas (antes/durante/después) cuando aporte señales útiles.
Los strings del JSON deben ser texto plano: sin markdown (nada de **, __, #, ni enlaces).
Responde SOLO JSON con keys: familySummary, before (string[]), during (string[]), after (string[]), meetingPoint, evacuationRoute.`,
      },
      {
        role: "user",
        content: `Edificio: ${JSON.stringify(building)}
Perfil familiar: ${JSON.stringify(input.profile)}
${visionBlock}
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

  const cleanItems = (items: string[] | undefined, fallback: string[]) =>
    (items?.length ? items : fallback).map((i) => stripMarkdown(i));

  return {
    id: `plan-${building.id}-${Date.now()}`,
    buildingId: building.id,
    buildingName: building.name,
    sectorId: building.sectorId,
    sectorName: building.sectorName,
    riskLevel: building.riskLevel,
    hazardType: input.profile.hazardType,
    meetingPoint: stripMarkdown(
      parsed.meetingPoint || building.safeMeetingPoint
    ),
    evacuationRoute: stripMarkdown(
      parsed.evacuationRoute || building.evacuationNotes
    ),
    before: {
      title: "Antes",
      items: cleanItems(parsed.before, ["Preparar kit y roles."]),
    },
    during: {
      title: "Durante",
      items: cleanItems(parsed.during, ["Protégete y evacúa con calma."]),
    },
    after: {
      title: "Después",
      items: cleanItems(parsed.after, [
        "Punto de encuentro y canales oficiales.",
      ]),
    },
    sources,
    generatedAt: new Date().toISOString(),
    familySummary: stripMarkdown(
      parsed.familySummary ||
        `Plan personalizado para ${building.name} — riesgo ${building.riskLevel}.`
    ),
  };
}
