/**
 * Verificación básica de entregables PWA / offline.
 * Ejecutar tras `npm run build`.
 */
import { existsSync, readFileSync } from "fs";
import path from "path";

const root = process.cwd();
const checks = [
  ["manifest", "public/manifest.webmanifest"],
  ["icon-192", "public/icons/icon-192.png"],
  ["icon-512", "public/icons/icon-512.png"],
  ["sw (build)", "public/sw.js"],
  ["workbox", "public/workbox-"],
];

let ok = true;
for (const [name, rel] of checks) {
  if (rel.endsWith("-")) {
    const dir = path.join(root, "public");
    const { readdirSync } = await import("fs");
    const found = existsSync(dir) && readdirSync(dir).some((f) => f.startsWith("workbox-"));
    console.log(found ? "✓" : "✗", name, found ? "(generado en build)" : "falta — corre npm run build");
    if (!found) ok = false;
    continue;
  }
  const p = path.join(root, rel);
  const found = existsSync(p);
  console.log(found ? "✓" : "✗", name, rel);
  if (!found) ok = false;
}

if (existsSync(path.join(root, "public/manifest.webmanifest"))) {
  const m = JSON.parse(readFileSync(path.join(root, "public/manifest.webmanifest"), "utf8"));
  console.log("✓ manifest name:", m.short_name, "| theme:", m.theme_color);
}

process.exit(ok ? 0 : 1);
