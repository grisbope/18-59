"use client";

import { useEffect, useRef } from "react";

/** Reloj detenido a las 18:58 — elemento visual central del hero. */
export function StoppedClock({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("clock-enter");
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 240 240"
      role="img"
      aria-label="Reloj detenido a las 18:58, monumento de Portoviejo"
      className={`clock-face ${className}`}
    >
      <circle cx="120" cy="120" r="110" fill="#F7F4F1" stroke="#1A1A1A" strokeWidth="8" />
      <circle cx="120" cy="120" r="100" fill="none" stroke="#4A4A4A" strokeWidth="1.5" />
      {/* marcas horas */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        const x1 = 120 + Math.cos(a) * 82;
        const y1 = 120 + Math.sin(a) * 82;
        const x2 = 120 + Math.cos(a) * 94;
        const y2 = 120 + Math.sin(a) * 94;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#1A1A1A"
            strokeWidth={i % 3 === 0 ? 3 : 1.5}
            strokeLinecap="round"
          />
        );
      })}
      {/* manecilla hora ~7 (18) */}
      <line
        className="clock-hand-hour"
        x1="120"
        y1="120"
        x2="120"
        y2="70"
        stroke="#1A1A1A"
        strokeWidth="6"
        strokeLinecap="round"
        transform="rotate(210 120 120)"
      />
      {/* manecilla minuto en 58 */}
      <line
        className="clock-hand-minute"
        x1="120"
        y1="120"
        x2="120"
        y2="48"
        stroke="#C45C3E"
        strokeWidth="4"
        strokeLinecap="round"
        transform="rotate(348 120 120)"
      />
      <circle cx="120" cy="120" r="7" fill="#C45C3E" />
      <text
        x="120"
        y="168"
        textAnchor="middle"
        fill="#1A1A1A"
        fontSize="22"
        fontWeight="700"
        fontFamily="var(--font-display), Georgia, serif"
      >
        18:58
      </text>
      <text
        x="120"
        y="188"
        textAnchor="middle"
        fill="#4A4A4A"
        fontSize="10"
        letterSpacing="1"
      >
        PORTOVIEJO
      </text>
    </svg>
  );
}
