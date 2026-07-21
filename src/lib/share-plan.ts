import type { FamilyPlan } from "./utils";
import { getSupabaseAdmin, STORAGE_BUCKET } from "./supabase";

const memoryPlans = new Map<string, FamilyPlan>();

/** Plan listo para compartir (sin fotos; FamilyPlan ya no las incluye). */
export function toShareablePlan(plan: FamilyPlan): FamilyPlan {
  return {
    id: plan.id,
    buildingId: plan.buildingId,
    buildingName: plan.buildingName,
    sectorId: plan.sectorId,
    sectorName: plan.sectorName,
    riskLevel: plan.riskLevel,
    hazardType: plan.hazardType,
    meetingPoint: plan.meetingPoint,
    evacuationRoute: plan.evacuationRoute,
    before: plan.before,
    during: plan.during,
    after: plan.after,
    sources: plan.sources,
    generatedAt: plan.generatedAt,
    familySummary: plan.familySummary,
  };
}

function objectPath(id: string) {
  const safe = id.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return `shared-plans/${safe}.json`;
}

export async function saveShareablePlan(plan: FamilyPlan): Promise<{
  id: string;
  path: string;
}> {
  const shareable = toShareablePlan(plan);
  memoryPlans.set(shareable.id, shareable);

  const admin = getSupabaseAdmin();
  const path = objectPath(shareable.id);
  if (admin) {
    const { error } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(path, JSON.stringify(shareable), {
        contentType: "application/json",
        upsert: true,
      });
    if (error) {
      // Seguimos con memoria del proceso; el GET puede fallar en otro pod
      console.error("saveShareablePlan storage:", error.message);
    }
  }
  return { id: shareable.id, path };
}

export async function loadShareablePlan(
  id: string
): Promise<FamilyPlan | null> {
  if (!id || id.length > 160) return null;

  const cached = memoryPlans.get(id);
  if (cached) return cached;

  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .download(objectPath(id));
  if (error || !data) return null;

  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as FamilyPlan;
    if (!parsed?.id || !parsed?.before?.items) return null;
    memoryPlans.set(parsed.id, parsed);
    return parsed;
  } catch {
    return null;
  }
}
