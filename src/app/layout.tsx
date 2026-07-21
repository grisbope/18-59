import type { Metadata, Viewport } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

const display = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "18:59 — Plan familiar ante sismos | Portoviejo",
  description:
    "El plan de qué hacer antes, durante y después de un sismo — para tu familia y tu edificio en Portoviejo. Escúchalo, descárgalo en PDF y compártelo. ODS 11 y 13.",
  applicationName: "18:59",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "18:59",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "192x192" }],
  },
  openGraph: {
    title: "18:59 — El minuto siguiente",
    description:
      "Plan familiar Antes / Durante / Después de un sismo. Personalizado, con voz, PDF y capa comunitaria en Portoviejo.",
    locale: "es_EC",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#C45C3E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        <AuthProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
