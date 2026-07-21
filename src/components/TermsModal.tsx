"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function TermsContent() {
  return (
    <div className="prose-1859 space-y-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
      <p>
        <strong className="text-[var(--color-ink)]">18:59</strong> es una Progressive
        Web App de impacto social nacida en Portoviejo. Al usar la plataforma aceptas
        estos términos.
      </p>
      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-ink)]">
        Ubicación y fotos de fachada
      </h3>
      <p>
        Los datos de ubicación (selección de edificio) y las fotos de fachada se
        utilizan <strong>únicamente</strong> para generar tu plan de resiliencia
        familiar y el análisis visual opcional. <strong>Nunca</strong> se exponen de
        forma individual en el tablero comunitario: solo se muestran agregados por
        sector (por ejemplo, % de hogares con plan documentado).
      </p>
      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-ink)]">
        Contenido de seguridad
      </h3>
      <p>
        Las recomendaciones se basan en fuentes oficiales citadas (informes de
        vulnerabilidad post-16A, Lineamientos Estratégicos / SNGR Ecuador y guías
        relacionadas). <strong>No sustituyen</strong> las instrucciones de las
        autoridades de gestión de riesgos ni un peritaje estructural profesional.
      </p>
      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-ink)]">
        Auth, almacenamiento y notificaciones
      </h3>
      <p>
        La autenticación y el almacenamiento de planes pueden realizarse mediante
        Supabase (Auth, Postgres, Storage). Las notificaciones push son un
        complemento secundario para mensajes oficiales; al habilitarlas otorgas
        consentimiento para recibirlas. Puedes revocar permisos en el navegador.
      </p>
      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-ink)]">
        Licencia y contacto
      </h3>
      <p>
        El código es open source — ver el repositorio del proyecto. Responsable /
        contacto: <a href="mailto:info@grisbon.com">info@grisbon.com</a> · Grisbon
        LLC · Portoviejo, Ecuador.
      </p>
      <p>
        Versión completa también en{" "}
        <Link href="/terminos" className="font-semibold text-[var(--color-terracotta)] underline">
          /terminos
        </Link>
        .
      </p>
    </div>
  );
}

export function TermsModal({
  open,
  onOpenChange,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  trigger?: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-lg focus:outline-none">
          <div className="mb-4 flex items-start justify-between gap-3">
            <Dialog.Title className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]">
              Términos y Privacidad
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Términos de uso y política de privacidad de 18:59
          </Dialog.Description>
          <TermsContent />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
