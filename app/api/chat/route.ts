import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { studySystemPrompt } from "@/lib/document";

export async function POST(request: Request) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { documentId, question } = await request.json();
  if (!documentId || typeof question !== "string" || !question.trim()) return NextResponse.json({ error: "A question is required." }, { status: 400 });
  const { data: document } = await supabase.from("documents").select("id, processing_status").eq("id", documentId).eq("user_id", user.id).single();
  if (!document || document.processing_status !== "ready") return NextResponse.json({ error: "This document is not ready yet." }, { status: 400 });
  const embedding = await openai.embeddings.create({ model: "text-embedding-3-small", input: question });
  const { data: matches, error } = await supabase.rpc("match_document_chunks", { query_embedding: embedding.data[0].embedding, match_document_id: documentId, match_count: 6 });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const sources = (matches || []).map((match: { content: string; page_number: number }) => ({ page: match.page_number, snippet: match.content.slice(0, 180) }));
  const context = sources.map((source: { page: number; snippet: string }) => `[Page ${source.page}] ${source.snippet}`).join("\n\n");
  const answer = await openai.responses.create({ model: "gpt-4.1-mini", instructions: studySystemPrompt, input: `NOTE CONTEXT:\n${context}\n\nSTUDENT QUESTION:\n${question}` });
  await supabase.from("usage_events").insert({ user_id: user.id, event_type: "chat", input_tokens: answer.usage?.input_tokens || 0, output_tokens: answer.usage?.output_tokens || 0 });
  return NextResponse.json({ answer: answer.output_text, sources });
}
