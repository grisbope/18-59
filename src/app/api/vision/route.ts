import { NextResponse } from "next/server";
import { getOpenAI, hasOpenAI } from "@/lib/openai";
import { retrieveRAG } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });
    }

    const chunks = await retrieveRAG(
      "fachada grietas mampostería planta blanda voladizos Portoviejo post-16A",
      3
    );
    const context = chunks.map((c) => c.text).join("\n");

    if (!hasOpenAI()) {
      return NextResponse.json({
        analysis: `Análisis demo (sin OPENAI_API_KEY).\n\nPatrones a observar según corpus post-16A:\n- Grietas diagonales en muros de fachada\n- Posible planta baja comercial abierta (planta blanda)\n- Cornisas o voladizos deteriorados\n- Parches de reparación cosméticas\n\nContexto RAG:\n${context.slice(0, 600)}\n\nEsto no es un peritaje. Consulta a un técnico competente y a autoridades locales.`,
        mode: "demo",
      });
    }

    const openai = getOpenAI()!;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Eres experto en comunicación de riesgo sísmico en Portoviejo. Analizas fachadas con prudencia.
Usa patrones del corpus post-16A. Lenguaje simple en español. Nunca digas que el edificio colapsará o que está 100% seguro.
Cierra recomendando evaluación profesional. Menciona que la foto no se comparte en tableros comunitarios.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Contexto técnico:\n${context}\n\nDescribe posibles señales visibles de vulnerabilidad en esta fachada.`,
            },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      max_tokens: 700,
    });

    return NextResponse.json({
      analysis: completion.choices[0]?.message?.content ?? "Sin resultado",
      mode: "openai",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error Vision" },
      { status: 500 }
    );
  }
}
