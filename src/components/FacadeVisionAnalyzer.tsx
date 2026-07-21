"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Camera, Home, Loader2, MapPinned, Trash2, Building2 } from "lucide-react";

type SlotKey = "exterior" | "interior" | "ctx0" | "ctx1" | "ctx2";

type SlotState = {
  preview: string | null;
  fileName?: string;
};

const emptySlots = (): Record<SlotKey, SlotState> => ({
  exterior: { preview: null },
  interior: { preview: null },
  ctx0: { preview: null },
  ctx1: { preview: null },
  ctx2: { preview: null },
});

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

function SlotUpload({
  id,
  label,
  hint,
  required,
  icon,
  slot,
  onPick,
  onClear,
}: {
  id: string;
  label: string;
  hint: string;
  required?: boolean;
  icon: ReactNode;
  slot: SlotState;
  onPick: (file: File | null) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-paper)] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
            {icon}
            {label}
            {required ? (
              <span className="text-xs font-normal text-[var(--color-terracotta)]">
                Obligatoria
              </span>
            ) : (
              <span className="text-xs font-normal text-[var(--color-muted)]">
                Opcional
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{hint}</p>
        </div>
        {slot.preview && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]"
            aria-label={`Quitar ${label}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {slot.preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slot.preview}
          alt={`Vista previa: ${label}`}
          className="mt-3 h-36 w-full rounded-md object-cover"
        />
      ) : (
        <label
          htmlFor={id}
          className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[var(--color-border)] px-3 py-6 text-center text-xs text-[var(--color-muted)]"
        >
          <Camera className="h-5 w-5 text-[var(--color-terracotta)]" aria-hidden />
          <span className="font-medium text-[var(--color-ink-soft)]">Elegir foto</span>
        </label>
      )}

      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          void onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      {slot.preview && (
        <label
          htmlFor={id}
          className="mt-2 inline-block cursor-pointer text-xs font-medium text-[var(--color-resilience)] underline-offset-2 hover:underline"
        >
          Cambiar foto
        </label>
      )}
    </div>
  );
}

export function FacadeVisionAnalyzer() {
  const [slots, setSlots] = useState(emptySlots);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setSlot(key: SlotKey, file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes.");
      return;
    }
    setError(null);
    setResult(null);
    try {
      const dataUrl = await readAsDataUrl(file);
      setSlots((prev) => ({
        ...prev,
        [key]: { preview: dataUrl, fileName: file.name },
      }));
    } catch {
      setError("No se pudo cargar la imagen.");
    }
  }

  function clearSlot(key: SlotKey) {
    setSlots((prev) => ({ ...prev, [key]: { preview: null } }));
    setResult(null);
  }

  async function analyze() {
    setError(null);
    setResult(null);

    if (!slots.exterior.preview) {
      setError("Sube la foto del exterior (fachada). Es obligatoria.");
      return;
    }
    if (!slots.interior.preview) {
      setError("Sube la foto del interior. Es obligatoria.");
      return;
    }

    const context = [slots.ctx0, slots.ctx1, slots.ctx2]
      .map((s) => s.preview)
      .filter((p): p is string => Boolean(p));

    setLoading(true);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exterior: slots.exterior.preview,
          interior: slots.interior.preview,
          context,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de análisis");
      setResult(data.analysis as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo analizar");
    } finally {
      setLoading(false);
    }
  }

  const ready = Boolean(slots.exterior.preview && slots.interior.preview);
  const contextCount = [slots.ctx0, slots.ctx1, slots.ctx2].filter(
    (s) => s.preview
  ).length;

  return (
    <Card aria-labelledby="vision-title">
      <CardTitle id="vision-title">Análisis visual de tu vivienda</CardTitle>
      <CardDescription>
        Obligatorias: una foto del exterior y una del interior. Opcionales: hasta
        3 del barrio, de los lados o de lo cercano (para ver si hay edificios o
        elementos que puedan caer). Las fotos no se publican en el tablero
        comunitario.
      </CardDescription>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SlotUpload
          id="vision-exterior"
          label="Exterior / fachada"
          hint="Frente de la casa o edificio"
          required
          icon={<Building2 className="h-4 w-4 text-[var(--color-terracotta)]" />}
          slot={slots.exterior}
          onPick={(f) => void setSlot("exterior", f)}
          onClear={() => clearSlot("exterior")}
        />
        <SlotUpload
          id="vision-interior"
          label="Interior"
          hint="Pasillo, sala o zona estructural visible"
          required
          icon={<Home className="h-4 w-4 text-[var(--color-terracotta)]" />}
          slot={slots.interior}
          onPick={(f) => void setSlot("interior", f)}
          onClear={() => clearSlot("interior")}
        />
      </div>

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <MapPinned className="h-4 w-4 text-[var(--color-resilience)]" />
          Entorno cercano ({contextCount}/3)
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["ctx0", "Lado / calle", "Fachada lateral o calle"],
              ["ctx1", "Barrio", "Manzana o vecinos"],
              ["ctx2", "Cercano", "Elementos que puedan caer"],
            ] as const
          ).map(([key, label, hint]) => (
            <SlotUpload
              key={key}
              id={`vision-${key}`}
              label={label}
              hint={hint}
              icon={<Camera className="h-4 w-4 text-[var(--color-muted)]" />}
              slot={slots[key]}
              onPick={(f) => void setSlot(key, f)}
              onClear={() => clearSlot(key)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="resilience"
          onClick={() => void analyze()}
          disabled={!ready || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analizando…
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" /> Analizar fotos
            </>
          )}
        </Button>
        {!ready && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Faltan fotos obligatorias (exterior e interior).
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-[var(--color-terracotta)]" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className="mt-4 rounded-md border border-[var(--color-border)] p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {result}
        </div>
      )}
    </Card>
  );
}
