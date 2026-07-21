"use client";

import { useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Camera, Loader2 } from "lucide-react";

export function FacadeVisionAnalyzer() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setLoading(true);
      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error de análisis");
        setResult(data.analysis as string);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo analizar");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <Card aria-labelledby="vision-title">
      <CardTitle id="vision-title">Análisis visual de fachada</CardTitle>
      <CardDescription>
        Bonus: GPT-4o Vision compara tu foto con patrones documentados post-16A.
        La imagen no se publica en el tablero comunitario.
      </CardDescription>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-paper)] px-4 py-8 text-sm">
        <Camera className="h-6 w-6 text-[var(--color-terracotta)]" aria-hidden />
        <span className="font-semibold">Subir foto de fachada</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Vista previa de fachada"
          className="mt-4 max-h-56 w-full rounded-md object-cover"
        />
      )}

      {loading && (
        <p className="mt-3 flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Analizando con Vision…
        </p>
      )}
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
