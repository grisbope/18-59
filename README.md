# 18:59 — Planes de resiliencia familiar desde Portoviejo

> **Tagline oficial:** *En 2016 el reloj se detuvo en 18:58. Nosotros construimos el minuto siguiente.*

Progressive Web App (PWA) nacida en Portoviejo, Ecuador, alineada con **ODS 11** (Ciudades y comunidades sostenibles) y **ODS 13** (Acción por el clima). No es una app de alertas: es un **generador de planes de resiliencia familiar con IA**, con gemelo digital de edificio y capa comunitaria.

**Repositorio:** [github.com/grisbope/18-59](https://github.com/grisbope/18-59)

---

## ODS elegido

| ODS | Enfoque en 18:59 |
|-----|------------------|
| **ODS 11** (principal) | Reducir muertes y personas afectadas por desastres; fortalecer planificación urbana y preparación comunitaria por sector |
| **ODS 13** | Mejorar resiliencia y adaptación ante riesgos climáticos en territorio costero vulnerable (Manabí): inundación y sequía además de sismo |

---

## Problema validado (datos reales)

Portoviejo fue zona cero del terremoto **7.8 del 16 de abril de 2016**. El reloj del antiguo centro comercial municipal quedó congelado a las **18:58** —hoy monumento oficial en la Plaza Memorial San Gregorio—.

- **88 manzanas** del centro histórico devastadas; edificaciones colapsadas en el casco urbano.
- Nueve años después, muchas familias viven en **bloques multifamiliares de alto riesgo estructural** sin conocer el nivel real de peligro ni rutas de evacuación seguras.
- La brecha crítica no es “recibir otra notificación”: es **no tener un plan familiar documentado, compartible y usable offline** en el minuto de la emergencia.

Fuentes de referencia del corpus RAG (ver `src/data/corpus/`):

- Informes técnicos de vulnerabilidad sísmica post-16A (edificaciones Portoviejo).
- Lineamientos Estratégicos para la Reducción de Riesgos — SNGR / Ecuador.
- Guías oficiales de preparación ante sismo, inundación y sequía.

---

## Pivote / diferenciadores (no vender como app de alertas)

1. **Plan vivo, no notificación** — Documento personalizado antes / durante / después (sismo, inundación, sequía), adaptado a vivienda y composición familiar.
2. **Gemelo digital a nivel de edificio** — Cruza dirección/bloque con informes reales de vulnerabilidad sísmica post-2016 (dato hiperlocal).
3. **Capa comunitaria** — El plan se comparte con vecinos y líderes barriales; tablero agregado por sector con **% de hogares con plan documentado** (métrica central del pitch).

**Bonus demoable:** foto de fachada + GPT-4o Vision explica señales visibles de vulnerabilidad, comparando con patrones documentados post-16A.

---

## Métrica de impacto

| Tipo | Métrica |
|------|---------|
| **Principal** | % de hogares en sectores piloto que pasan de no tener plan de evacuación a tener uno **generado, guardado y compartido** en la plataforma (medible en vivo en el demo) |
| **Secundaria** | Tiempo promedio desde alerta oficial publicada hasta instrucciones adaptadas en lenguaje simple |

El tablero comunitario (`CommunityDashboard`) muestra el % en tiempo real (Supabase Realtime o store demo).

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  PWA Next.js (App Router) — instalable, offline-first       │
│  Hero · MapPicker · BuildingTwinCard · ActionPlanViewer     │
│  CommunityDashboard · TTS · Service Worker (Workbox)        │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
             ▼                               ▼
┌────────────────────────┐     ┌─────────────────────────────┐
│  Agente orquestador    │     │  Supabase                   │
│  (OpenAI Agents SDK)   │     │  Auth · Postgres · Storage  │
│  1. Seleccionar edificio│     │  Tablero agregado por sector│
│  2. RAG informe riesgo │     │  Planes (sin PII en board)  │
│  3. Generar plan GPT   │     └─────────────────────────────┘
│  4. Empaquetar + TTS   │
│  5. Registrar + board  │
└────────────┬───────────┘
             ▼
┌────────────────────────┐
│  RAG + embeddings      │
│  Corpus Portoviejo +   │
│  SNGR / Lineamientos   │
│  Vector store local    │
└────────────────────────┘
```

### Plantilla territorial (escalabilidad)

Las capas de riesgo (`src/data/buildings.json`) y el corpus (`src/data/corpus/`) son **intercambiables**. Para otra ciudad se reemplazan datos y documentos de referencia sin reescribir la app (mismo patrón que FloodFact AI adapta asentamientos, o proyectos Mekong para riesgo agrícola).

---

## Herramientas OpenAI usadas

| Herramienta | Uso en 18:59 |
|-------------|--------------|
| **GPT (texto)** | Genera el plan de resiliencia familiar citando fuentes del corpus |
| **GPT-4o Vision** | Analiza fotos de fachada y señala vulnerabilidades estructurales visibles |
| **TTS (OpenAI)** | Lee el plan en voz alta (accesibilidad / barreras digitales) |
| **Embeddings + RAG** | Recupera fragmentos de informes post-16A y lineamientos SNGR |
| **Agents SDK** | Orquesta: edificio → informe → plan → documento → Supabase → tablero |
| **Codex** | Usado durante el desarrollo para scaffolding, APIs, PWA y componentes |

Documentación para el jurado: ruta **`/jurado`**.

---

## Stack

- **Frontend:** Next.js 15 (App Router) + React + TypeScript + Tailwind + Radix UI
- **PWA:** `manifest.webmanifest` + Service Worker Workbox (`@ducanh2912/next-pwa`) — Cache API / offline del plan
- **Backend/datos:** Supabase (auth, storage, Postgres agregado comunitario)
- **IA:** OpenAI (GPT, Vision, TTS, embeddings, Agents SDK)
- **Hosting:** Vercel (recomendado)

---

## Privacidad

- Ubicación y fotos de fachada **solo** para generar el plan; **nunca** se exponen individualmente en el tablero comunitario (solo agregados por sector).
- Toda recomendación de seguridad **cita fuente oficial**.
- El contenido **no sustituye** instrucciones de autoridades de gestión de riesgos.
- Ver [Términos y Privacidad](/terminos).

---

## Instalación y demo

### Requisitos

- Node.js 20+
- Cuenta OpenAI (obligatoria para IA en vivo)
- Proyecto Supabase (auth + Postgres); sin credenciales la app corre en **modo demo** con store en memoria/localStorage

### Variables de entorno

Copiar `.env.example` → `.env.local`:

```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo servidor
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### SQL Supabase

Ejecutar `supabase/schema.sql` en el SQL Editor del proyecto.

### Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

### Producción — VPS (`https://18-59.grisbope.com`)

La app corre en el VPS EasyPanel (Docker Swarm + Traefik) en `18-59.grisbope.com`.

**Deploy automático:** cada push a `main` se detecta en el servidor (cron cada 2 min → `deploy/auto-pull.sh` → `deploy/deploy.sh`). No hace falta entrar al VPS.

Deploy manual en el servidor:

```bash
cd /opt/apps/18-59
bash deploy/deploy.sh
```

Variables opcionales en `/opt/apps/18-59/.env.production` (`OPENAI_API_KEY`, Supabase, etc.).

> Opcional (GitHub Actions): el workflow `.github/workflows/deploy.yml` está listo; hay que configurar en el repo los secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (y `VPS_PORT` si aplica) para deploy inmediato por SSH además del auto-pull.

---

## Estructura de carpetas

1. Landing → reloj 18:58 + tagline → **Generar mi plan**
2. Mapa: seleccionar bloque de alto riesgo en centro histórico
3. Gemelo digital (`BuildingTwinCard`) + plan vivo (`ActionPlanViewer`) con citas
4. Opcional: foto de fachada (Vision) + voz (TTS)
5. Compartir plan → tablero comunitario: **% hogares con plan** sube en vivo
6. DevTools → Offline → abrir plan cacheado (razón de ser PWA)
7. `/jurado` → checklist de rúbrica

### Instalar PWA

En Android/Chrome: menú → **Instalar app** / Add to Home Screen. En iOS Safari: Compartir → Añadir a pantalla de inicio. El botón **Instalar app** del hero dispara el prompt cuando está disponible.

---

## Estructura de carpetas

```
src/
  app/                 # App Router: landing, plan, comunidad, jurado, terminos, APIs
  components/          # UI + Hero, BuildingTwinCard, ActionPlanViewer, CommunityDashboard, MapPicker
  lib/                 # openai, supabase, rag, agents, offline, utils
  data/                # buildings.json + corpus RAG
public/                # manifest, icons, SW generado en build
supabase/              # schema.sql
```

---

## Plan B (contingencia)

Si el corpus de riesgo urbano se vuelve demasiado pesado de limpiar en el tiempo disponible, el pivote de respaldo es un **navegador de salud preventiva** por voz y texto para poblaciones con barreras digitales (**ODS 3** y **ODS 10**), reutilizando la misma arquitectura **RAG + GPT + voz + agente**, cambiando solo el corpus y los flujos de usuario.

---

## Escalabilidad (roadmap)

1. Más fuentes municipales y universidades (capas GIS, microzonificación).
2. API pública de perfiles de riesgo por edificio (reutilizable por municipios).
3. Plantillas territoriales para otras ciudades costeras de la región.
4. Integración formal con canales oficiales SNGR (la capa push permanece **secundaria**).

---

## Licencia

Código open source — ver repositorio. Proyecto de impacto social / hackathon.

**Contacto / responsable del proyecto:** info@grisbon.com — Grisbon LLC · Portoviejo, Ecuador.

---

*18:59 — el minuto que la ciudad no tuvo, para cada familia.*
