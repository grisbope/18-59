import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-[family-name:var(--font-display)] text-5xl text-[var(--color-terracotta)]">
        18:58
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl">
        Modo offline
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted)]">
        Sin conexión — como en una emergencia real. Si ya generaste tu plan, está
        guardado en este dispositivo (Cache API / almacenamiento local).
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/plan">Abrir flujo de plan</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Inicio</Link>
        </Button>
      </div>
    </main>
  );
}
