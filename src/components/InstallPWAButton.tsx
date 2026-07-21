"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWAButton({
  variant = "outline",
  size = "lg",
}: {
  variant?: "outline" | "secondary" | "ghost";
  size?: "default" | "lg" | "sm";
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <Button variant={variant} size={size} disabled>
        App instalada
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={async () => {
        if (deferred) {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        } else {
          alert(
            "En este navegador usa el menú: «Instalar app» o «Añadir a pantalla de inicio»."
          );
        }
      }}
    >
      Instalar app
    </Button>
  );
}

export function CtaGeneratePlan({ size = "lg" }: { size?: "default" | "lg" }) {
  return (
    <Button asChild size={size}>
      <Link href="/plan">Generar mi plan</Link>
    </Button>
  );
}
