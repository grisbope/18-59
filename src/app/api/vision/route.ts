import { NextResponse } from "next/server";
import { getOpenAI, hasOpenAI } from "@/lib/openai";
import { retrieveRAG } from "@/lib/rag";
import { stripMarkdown } from "@/lib/text";

export const runtime = "nodejs";

type VisionBody = {
  /** Compat: una sola imagen (se trata como exterior). */
  image?: string;
  exterior?: string;
  interior?: string;
  /** Hasta 3 fotos opcionales: barrio, lados, entorno cercano. */
  context?: string[];
};

function isValidImage(url: unknown): url is string {
  return (
    typeof url === "string" &&
    (url.startsWith("data:image/") || url.startsWith("http"))
  );
}

function isTooSmall(url: string): boolean {
  return url.startsWith("data:image/") && url.length < 2000;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VisionBody;

    const exterior = body.exterior || body.image;
    const interior = body.interior;
    const contextPhotos = Array.isArray(body.context)
      ? body.context.filter(isValidImage).slice(0, 3)
      : [];

    if (!isValidImage(exterior)) {
      return NextResponse.json(
        { error: "Foto del exterior (fachada) obligatoria" },
        { status: 400 }
      );
    }
    if (!isValidImage(interior)) {
      return NextResponse.json(
        { error: "Foto del interior obligatoria" },
        { status: 400 }
      );
    }
    if (isTooSmall(exterior) || isTooSmall(interior)) {
      return NextResponse.json(
        {
          error:
            "Alguna imagen obligatoria es demasiado pequeña o vacía. Sube fotos claras.",
        },
        { status: 400 }
      );
    }
    for (const c of contextPhotos) {
      if (isTooSmall(c)) {
        return NextResponse.json(
          {
            error:
              "Una foto del entorno es demasiado pequeña. Usa una foto más clara o quítala.",
          },
          { status: 400 }
        );
      }
    }

    const chunks = await retrieveRAG(
      "fachada interior planta blanda grietas mampostería entorno edificios vecinos Portoviejo post-16A",
      4
    );
    const ragContext = chunks.map((c) => c.text).join("\n");

    if (!hasOpenAI()) {
      return NextResponse.json({
        analysis: stripMarkdown(
          `Análisis demo (sin OPENAI_API_KEY).

Fotos recibidas: exterior sí, interior sí, entorno ${contextPhotos.length}/3.

Patrones a observar según corpus post-16A:
• Exterior: grietas diagonales, planta baja abierta, cornisas o voladizos
• Interior: columnas, tabiques, humedades, ampliaciones
• Entorno: edificios contiguos, calles estrechas, elementos que puedan caer

Contexto RAG:
${ragContext.slice(0, 500)}

Esto no es un peritaje. Consulta a un técnico competente y a autoridades locales.`
        ),
        mode: "demo",
        photos: {
          exterior: true,
          interior: true,
          context: contextPhotos.length,
        },
      });
    }

    const openai = getOpenAI()!;

    const contentParts: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [
      {
        type: "text",
        text: `Contexto técnico (RAG):
${ragContext}

Analiza las fotos en este orden:
1) EXTERIOR / FACHADA (obligatoria)
2) INTERIOR (obligatoria)
3) ENTORNO / BARRIO / LADOS (${contextPhotos.length} foto(s) opcionales; puede ser 0)

Indica señales visibles de vulnerabilidad (sin alarmismo), qué aporta el entorno (edificios vecinos, calles, elementos que puedan caer) y recomendaciones prácticas para la familia.
Responde en español claro. NO uses markdown (sin **, #, listas con -). Usa párrafos cortos o viñetas con el símbolo •.`,
      },
      { type: "text", text: "Foto 1 — Exterior / fachada:" },
      { type: "image_url", image_url: { url: exterior } },
      { type: "text", text: "Foto 2 — Interior:" },
      { type: "image_url", image_url: { url: interior } },
    ];

    contextPhotos.forEach((url, i) => {
      contentParts.push({
        type: "text",
        text: `Foto ${i + 3} — Entorno / barrio / lado:`,
      });
      contentParts.push({ type: "image_url", image_url: { url } });
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Eres experto en comunicación de riesgo sísmico en Portoviejo. Analizas fachadas, interiores y entorno con prudencia.
Usa patrones del corpus post-16A. Lenguaje simple en español. Nunca digas que el edificio colapsará o que está 100% seguro.
No uses formato markdown (nada de **, __, #, ni listas con guiones). Escribe texto plano con viñetas • si hace falta.
Cierra recomendando evaluación profesional. Menciona que las fotos no se comparten en tableros comunitarios.`,
        },
        { role: "user", content: contentParts },
      ],
      max_tokens: 1100,
    });

    const raw = completion.choices[0]?.message?.content ?? "Sin resultado";

    return NextResponse.json({
      analysis: stripMarkdown(raw),
      mode: "openai",
      photos: {
        exterior: true,
        interior: true,
        context: contextPhotos.length,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error Vision" },
      { status: 500 }
    );
  }
}
