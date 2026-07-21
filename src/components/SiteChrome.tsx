"use client";

import Link from "next/link";
import { useState } from "react";
import { TermsModal } from "@/components/TermsModal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/#utilidad", label: "Para qué sirve" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/plan", label: "Plan familiar" },
  { href: "/portoparques", label: "18:59 PortoParques" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/jurado", label: "Jurado" },
];

export function SiteHeader() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]"
        >
          18:59
        </Link>
        <nav
          className="hidden items-center gap-5 text-sm font-medium md:flex"
          aria-label="Principal"
        >
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
          {!loading &&
            (user ? (
              <div className="flex items-center gap-2">
                <span className="max-w-[10rem] truncate text-xs text-[var(--color-muted)]">
                  {user.fullName || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Salir
                </Button>
              </div>
            ) : (
              <Button asChild variant="secondary" size="sm">
                <Link href="/auth">Entrar</Link>
              </Button>
            ))}
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/plan"
            className="rounded-md bg-[var(--color-terracotta)] px-3 py-2 text-sm font-semibold text-white"
          >
            Plan
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-ink)]"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-[var(--color-border)] bg-white px-4 py-3 md:hidden"
          aria-label="Móvil"
        >
          <ul className="space-y-2 text-sm font-medium">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/auth" onClick={() => setMenuOpen(false)}>
                {user ? "Mi cuenta" : "Entrar / Registrarse"}
              </Link>
            </li>
            {user && (
              <li>
                <button type="button" onClick={logout}>
                  Salir
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
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
          <Link href="/auth" className="underline-offset-4 hover:underline">
            Auth
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
