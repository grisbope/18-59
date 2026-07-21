import { readFileSync, readdirSync } from "fs";
import path from "path";
import { getOpenAI, hasOpenAI } from "./openai";
import { plainExcerpt } from "./text";

export interface CorpusChunk {
  id: string;
  source: string;
  title: string;
  text: string;
  embedding?: number[];
}

const CORPUS_DIR = path.join(process.cwd(), "src/data/corpus");

let chunksCache: CorpusChunk[] | null = null;

function chunkText(text: string, source: string, title: string): CorpusChunk[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);
  return paragraphs.map((p, i) => ({
    id: `${source}-${i}`,
    source,
    title,
    text: p,
  }));
}

export function loadCorpus(): CorpusChunk[] {
  if (chunksCache) return chunksCache;
  const files = readdirSync(CORPUS_DIR).filter((f) => f.endsWith(".md"));
  const chunks: CorpusChunk[] = [];
  for (const file of files) {
    const raw = readFileSync(path.join(CORPUS_DIR, file), "utf8");
    const titleLine = raw.split("\n").find((l) => l.startsWith("# ")) ?? file;
    const title = titleLine.replace(/^#\s+/, "");
    chunks.push(...chunkText(raw, file, title));
  }
  chunksCache = chunks;
  return chunks;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9áéíóúñü]+/i)
    .filter((t) => t.length > 2);
}

/** Recuperación léxica local (siempre disponible). */
export function retrieveLexical(query: string, k = 5): CorpusChunk[] {
  const chunks = loadCorpus();
  const q = new Set(tokenize(query));
  const scored = chunks.map((c) => {
    const tokens = tokenize(c.text);
    let score = 0;
    for (const t of tokens) if (q.has(t)) score += 1;
    // boost títulos/fuentes relevantes
    if (c.source.includes("portoviejo") && query.toLowerCase().includes("portoviejo"))
      score += 2;
    if (c.source.includes("sngr") && /plan|evacu|antes|durante|despues|sequia|inund/.test(query.toLowerCase()))
      score += 2;
    return { c, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .filter((s) => s.score > 0)
    .map((s) => s.c);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

/** RAG con embeddings OpenAI cuando hay API key; fallback léxico. */
export async function retrieveRAG(query: string, k = 5): Promise<CorpusChunk[]> {
  const lexical = retrieveLexical(query, k);
  if (!hasOpenAI()) return lexical;

  try {
    const openai = getOpenAI()!;
    const chunks = loadCorpus();
    const embRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: [query, ...chunks.slice(0, 40).map((c) => c.text.slice(0, 800))],
    });
    const qEmb = embRes.data[0].embedding;
    const scored = chunks.slice(0, 40).map((c, i) => ({
      c,
      score: cosine(qEmb, embRes.data[i + 1].embedding),
    }));
    const top = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((s) => s.c);
    return top.length ? top : lexical;
  } catch {
    return lexical;
  }
}

export function formatSources(chunks: CorpusChunk[]) {
  return chunks.map((c) => ({
    title: c.title,
    excerpt: plainExcerpt(c.text, 220),
  }));
}
