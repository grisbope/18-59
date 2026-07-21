"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ActionPlanViewer } from "@/components/ActionPlanViewer";
import { Button } from "@/components/ui/Button";
import type { FamilyPlan } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function SharedPlanPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id || "");
  const [plan, setPlan] = useState<FamilyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("Enlace incompleto");
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const res = await fetch(
          `/api/shared-plan?id=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Plan no encontrado");
        setPlan(data.plan as FamilyPlan);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo abrir el plan");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-terracotta)]">
        Plan compartido · 18:59
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">
        Plan de resiliencia familiar
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Enlace abierto para vecinos o familia. No incluye fotos personales.
      </p>

      {loading && (
        <p className="mt-8 flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando plan…
        </p>
      )}
      {error && (
        <div className="mt-8 rounded-md border border-[var(--color-terracotta)] bg-[var(--color-paper)] p-4 text-sm">
          <p className="text-[var(--color-terracotta)]" role="alert">
            {error}
          </p>
          <Button asChild className="mt-3" size="sm" variant="secondary">
            <Link href="/plan">Crear mi plan</Link>
          </Button>
        </div>
      )}
      {plan && (
        <div className="mt-8 space-y-4">
          <ActionPlanViewer plan={plan} />
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="resilience" size="sm">
              <Link href="/plan">Crear el mío</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/comunidad">Ver comunidad</Link>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
