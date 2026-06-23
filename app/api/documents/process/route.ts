import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { chunkText, MAX_PAGES } from "@/lib/document";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { documentId } = await request.json();
  const { data: document } = await supabase.from("documents").select("*").eq("id", documentId).eq("user_id", user.id).single();
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  await supabase.from("documents").update({ processing_status: "processing", error_message: null }).eq("id", document.id);
  try {
    const { data: file, error: downloadError } = await supabase.storage.from("documents").download(document.storage_path);
    if (downloadError || !file) throw new Error(downloadError?.message || "Could not download PDF.");
    const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
    const info = await parser.getInfo({ parsePageInfo: true });
    if (info.total > MAX_PAGES) throw new Error(`This beta supports PDFs up to ${MAX_PAGES} pages.`);
    const chunks: { content: string; page_number: number }[] = [];
    for (let page = 1; page <= info.total; page += 1) {
      const parsedPage = await parser.getText({ partial: [page] });
      chunks.push(...chunkText(parsedPage.text, page));
    }
    await parser.destroy();
    if (!chunks.length) throw new Error("No readable text was found. Please upload a text-based PDF.");
    const embeddings = await openai.embeddings.create({ model: "text-embedding-3-small", input: chunks.map((chunk) => chunk.content) });
    const rows = chunks.map((chunk, index) => ({ document_id: document.id, user_id: user.id, content: chunk.content, page_number: chunk.page_number, chunk_index: index, embedding: embeddings.data[index].embedding }));
    const { error: insertError } = await supabase.from("document_chunks").insert(rows);
    if (insertError) throw new Error(insertError.message);
    await supabase.from("documents").update({ processing_status: "ready", page_count: info.total }).eq("id", document.id);
    return NextResponse.json({ ok: true, pageCount: info.total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Document processing failed.";
    await supabase.from("documents").update({ processing_status: "failed", error_message: message }).eq("id", document.id);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
