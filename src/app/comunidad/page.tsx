import { CommunityDashboard } from "@/components/CommunityDashboard";
import { getCommunityStats } from "@/lib/agents";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function ComunidadPage() {
  const stats = await getCommunityStats();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-resilience)]">
          ODS 11 · capa comunitaria
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">
          Tablero por sector
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
          Métrica central del pitch: % de hogares con plan generado, guardado y
          compartido. Sin datos individuales de ubicación ni fotos.
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/plan">Generar y compartir mi plan</Link>
          </Button>
        </div>
      </header>
      <CommunityDashboard initialStats={stats} />
    </main>
  );
}
