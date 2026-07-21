import Link from "next/link";
import { TermsContent } from "@/components/TermsModal";

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-[var(--color-terracotta)]">
        ← 18:59
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[var(--color-ink)]">
        Términos y Condiciones / Privacidad
      </h1>
      <div className="mt-8">
        <TermsContent />
      </div>
    </main>
  );
}
