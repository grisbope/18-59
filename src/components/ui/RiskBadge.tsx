import { cn, type RiskLevel, riskLabel } from "@/lib/utils";

const styles: Record<RiskLevel, string> = {
  alto: "bg-[var(--color-terracotta)] text-white",
  medio: "bg-[var(--color-ink-soft)] text-white",
  bajo: "bg-[var(--color-resilience)] text-white",
};

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
        styles[level],
        className
      )}
      aria-label={`Nivel de riesgo ${riskLabel(level)}`}
    >
      Riesgo {riskLabel(level)}
    </span>
  );
}
