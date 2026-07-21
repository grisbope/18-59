"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { downloadPlanMarkdown } from "@/lib/offline";
import { stripMarkdown } from "@/lib/text";
import type { FamilyPlan } from "@/lib/utils";
import { hazardLabel } from "@/lib/utils";
import { Download, Share2, Volume2, VolumeX } from "lucide-react";

export function ActionPlanViewer({
  plan,
  onShare,
  sharing,
}: {
  plan: FamilyPlan;
  onShare?: () => void;
  sharing?: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [ttsBusy, setTtsBusy] = useState(false);

  async function speakPlan() {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    setTtsBusy(true);
    const text = [
      plan.familySummary,
      "Antes: " + plan.before.items.join(". "),
      "Durante: " + plan.during.items.join(". "),
      "Después: " + plan.after.items.join(". "),
      "Punto de encuentro: " + plan.meetingPoint,
    ].join(". ");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 3500) }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        setSpeaking(true);
        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
        };
        await audio.play();
      } else {
        // Fallback Web Speech API
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "es-ES";
        u.onend = () => setSpeaking(false);
        setSpeaking(true);
        window.speechSynthesis.speak(u);
      }
    } catch {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      u.onend = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    } finally {
      setTtsBusy(false);
    }
  }

  const sections = [plan.before, plan.during, plan.after];

  return (
    <Card className="action-plan" aria-labelledby="plan-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-resilience)]">
            Plan vivo de resiliencia familiar
          </p>
          <CardTitle id="plan-title" className="mt-1">
            {plan.buildingName}
          </CardTitle>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {hazardLabel(plan.hazardType)} · {plan.sectorName}
          </p>
        </div>
        <RiskBadge level={plan.riskLevel} />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        {stripMarkdown(plan.familySummary)}
      </p>

      <div className="mt-4 grid gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-paper)] p-3 text-sm sm:grid-cols-2">
        <p>
          <strong>Punto de encuentro:</strong> {stripMarkdown(plan.meetingPoint)}
        </p>
        <p>
          <strong>Ruta:</strong> {stripMarkdown(plan.evacuationRoute)}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <section
            key={section.title}
            aria-labelledby={`sec-${section.title}`}
            className="rounded-md border border-[var(--color-border)] p-4"
          >
            <h4
              id={`sec-${section.title}`}
              className="font-[family-name:var(--font-display)] text-lg text-[var(--color-ink)]"
            >
              {section.title}
            </h4>
            <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm text-[var(--color-ink-soft)]">
              {section.items.map((item) => (
                <li key={item}>{stripMarkdown(item)}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <section className="mt-6" aria-labelledby="sources-title">
        <h4 id="sources-title" className="text-sm font-bold uppercase tracking-wide">
          Fuentes citadas
        </h4>
        <ul className="mt-2 space-y-2 text-sm text-[var(--color-muted)]">
          {plan.sources.map((s) => (
            <li key={s.title + s.excerpt.slice(0, 20)} className="border-l-2 border-[var(--color-terracotta)] pl-3">
              <strong className="text-[var(--color-ink)]">{s.title}</strong>
              <br />
              {stripMarkdown(s.excerpt)}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={speakPlan}
          disabled={ttsBusy}
          aria-pressed={speaking}
        >
          {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {speaking ? "Detener voz" : "Escuchar plan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => downloadPlanMarkdown(plan)}
        >
          <Download className="h-4 w-4" />
          Descargar
        </Button>
        {onShare && (
          <Button
            type="button"
            variant="resilience"
            size="sm"
            onClick={onShare}
            disabled={sharing}
          >
            <Share2 className="h-4 w-4" />
            {sharing ? "Compartiendo…" : "Compartir con comunidad"}
          </Button>
        )}
      </div>
    </Card>
  );
}
