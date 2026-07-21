"use client";

import Link from "next/link";
import { useState } from "react";
import { TermsModal } from "@/components/TermsModal";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/#problema", label: "Problema" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/plan", label: "Generar plan" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/jurado", label: "Jurado" },
];

export function SiteHeader() {
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]">
          18:59
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            >
              {l.label}
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setTermsOpen(true)}>
            Términos
          </Button>
        </nav>
        <Link
          href="/plan"
          className="rounded-md bg-[var(--color-terracotta)] px-3 py-2 text-sm font-semibold text-white md:hidden"
        >
          Generar plan
        </Link>
      </div>
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
    </header>
  );
}

export function SiteFooter() {
  const [termsOpen, setTermsOpen] = useState(false);
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-ink)] text-[var(--color-paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl">18:59</p>
          <p className="mt-1 max-w-md text-sm text-white/70">
            El minuto que la ciudad no tuvo, para cada familia. Portoviejo · ODS 11
            y 13.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="https://github.com/grisbope/18-59"
            className="underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Repositorio
          </a>
          <a
            href="https://github.com/grisbope/18-59/blob/main/README.md"
            className="underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            README
          </a>
          <Link href="/jurado" className="underline-offset-4 hover:underline">
            Para el jurado
          </Link>
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="underline-offset-4 hover:underline"
          >
            Términos
          </button>
          <Link href="/terminos" className="underline-offset-4 hover:underline">
            Privacidad
          </Link>
        </div>
      </div>
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
    </footer>
  );
}
