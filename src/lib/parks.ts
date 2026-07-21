import parksData from "@/data/parks.json";
import type { FamilyPlan, RiskLevel } from "./utils";
import { formatSources, retrieveRAG } from "./rag";
import { getOpenAI, hasOpenAI } from "./openai";
import { stripMarkdown } from "./text";

export type Park = {
  id: string;
  name: string;
  address: string;
  sectorId: string;
  sectorName: string;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  hazards: string[];
  safeMeetingPoint: string;
  evacuationNotes: string;
  notes?: string;
};

export type ParkEventProfile = {
  eventName: string;
  eventType: string;
  attendees: number;
  hasChildren: boolean;
  hasElderly: boolean;
  hasDisability: boolean;
  durationHours: number;
  organizerContact: string;
};

const parks = parksData as Park[];

export function listParks(): Park[] {
  return parks;
}

export function getPark(id: string): Park | undefined {
  return parks.find((p) => p.id === id);
}

function fallbackParkPlan(
  park: Park,
  profile: ParkEventProfile,
  sources: { title: string; excerpt: string }[],
  visionAnalysis?: string
): FamilyPlan {
  const before = [
    `Definir punto de encuentro del evento: ${park.safeMeetingPoint}.`,
    "Kit del evento: agua embotellada, botiquín, linterna, silbato, lista de asistentes, contactos de emergencia, megáfono o voz fuerte, cinta para señalizar.",
    "Alimentos no perecibles y snacks para niños si el evento supera 2 horas; sombra y sillas para adultos mayores.",
    "Recorrer el parque antes: salidas, baños, zonas de sombra, postes, escenarios temporales y calles de acceso.",
    profile.hasChildren
      ? "Identificar zona segura para niños y adulto responsable por grupo."
      : "Asignar roles de apoyo entre el equipo organizador.",
    profile.hasDisability
      ? "Verificar ruta accesible y zona de espera sin escalones."
      : "Mantener pasillos libres de cables y toldos mal anclados.",
    visionAnalysis
      ? "Revisar hallazgos de las fotos del lugar y del entorno antes de abrir el evento."
      : "Tomar fotos del escenario y alrededores para documentar riesgos visibles.",
  ];

  const during = [
    "Si hay sismo: agáchense, cúbranse y espérense; luego evacúen a zona abierta lejos de árboles altos, postes y fachadas.",
    "No correr hacia calles congestionadas; usar la ruta acordada.",
    "Contar asistentes en el punto de encuentro; reportar desaparecidos a autoridades.",
    "Ante aglomeración o pelea, bajar el volumen del evento y guiar por salidas laterales.",
  ];

  const after = [
    "Verificar heridas y aplicar botiquín sin improvisar medicamentos ajenos.",
    "No rearmar toldos ni escenarios dañados hasta revisión.",
    "Informar solo por canales oficiales y al contacto del organizador.",
    "Registrar lecciones: qué salió bien y qué falta para el próximo evento.",
  ];

  return {
    id: `park-${park.id}-${Date.now()}`,
    buildingId: park.id,
    buildingName: `${profile.eventName} · ${park.name}`,
    sectorId: park.sectorId,
    sectorName: park.sectorName,
    riskLevel: park.riskLevel,
    hazardType: "sismo",
    meetingPoint: park.safeMeetingPoint,
    evacuationRoute: park.evacuationNotes,
    before: { title: "Antes del evento", items: before },
    during: { title: "Durante una emergencia", items: during },
    after: { title: "Después", items: after },
    sources,
    generatedAt: new Date().toISOString(),
    familySummary: `Plan PortoParques para «${profile.eventName}» (${profile.eventType}) en ${park.name}. Asistentes estimados: ${profile.attendees}. Riesgo de zona: ${park.riskLevel}.`,
  };
}

export async function runParkEventAgent(input: {
  parkId: string;
  profile: ParkEventProfile;
  visionAnalysis?: string;
}): Promise<FamilyPlan> {
  const park = getPark(input.parkId);
  if (!park) throw new Error("Parque no encontrado");

  const query = [
    `Portoviejo parque ${park.name} evento resiliencia`,
    park.hazards.join(" "),
    park.notes || "",
    "evacuación aglomeración sismo SNGR",
    input.profile.hasChildren ? "niños en eventos" : "",
    input.profile.hasElderly ? "adultos mayores" : "",
  ].join(" ");

  const chunks = await retrieveRAG(query, 4);
  const sources = formatSources(chunks);

  if (!hasOpenAI()) {
    return fallbackParkPlan(
      park,
      input.profile,
      sources,
      input.visionAnalysis
    );
  }

  const openai = getOpenAI()!;
  const context = chunks.map((c) => `[${c.title}]\n${c.text}`).join("\n\n---\n\n");
  const visionBlock = input.visionAnalysis
    ? `\nAnálisis visual del parque/entorno:\n${input.visionAnalysis}\n`
    : "";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Eres el agente 18:59 PortoParques en Portoviejo. Generas planes de acción para EVENTOS EN PARQUES (ferias, conciertos, deportes, actos comunitarios).
Enfócate en: punto de encuentro, salidas, aglomeración, sismo, calor, árboles/postes, tráfico, kit del organizador (agua, botiquín, lista de asistentes, contactos).
Español claro, sin markdown. No sustituyas a autoridades.
JSON keys: familySummary, before (string[]), during (string[]), after (string[]), meetingPoint, evacuationRoute.`,
      },
      {
        role: "user",
        content: `Parque: ${JSON.stringify(park)}
Perfil del evento: ${JSON.stringify(input.profile)}
${visionBlock}
Contexto RAG:
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
    return fallbackParkPlan(
      park,
      input.profile,
      sources,
      input.visionAnalysis
    );
  }

  const clean = (items: string[] | undefined, fb: string[]) =>
    (items?.length ? items : fb).map((i) => stripMarkdown(i));

  return {
    id: `park-${park.id}-${Date.now()}`,
    buildingId: park.id,
    buildingName: `${input.profile.eventName} · ${park.name}`,
    sectorId: park.sectorId,
    sectorName: park.sectorName,
    riskLevel: park.riskLevel,
    hazardType: "sismo",
    meetingPoint: stripMarkdown(
      parsed.meetingPoint || park.safeMeetingPoint
    ),
    evacuationRoute: stripMarkdown(
      parsed.evacuationRoute || park.evacuationNotes
    ),
    before: {
      title: "Antes del evento",
      items: clean(parsed.before, [
        "Preparar kit y punto de encuentro del parque.",
      ]),
    },
    during: {
      title: "Durante una emergencia",
      items: clean(parsed.during, ["Evacuar a zona abierta con calma."]),
    },
    after: {
      title: "Después",
      items: clean(parsed.after, ["Verificar asistentes y canales oficiales."]),
    },
    sources,
    generatedAt: new Date().toISOString(),
    familySummary: stripMarkdown(
      parsed.familySummary ||
        `Plan PortoParques para ${input.profile.eventName} en ${park.name}.`
    ),
  };
}
