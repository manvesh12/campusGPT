import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { studySystemPrompt } from "@/lib/document";

const prompts: Record<string, string> = {
  summary: "Create a concise Hinglish revision summary with main concepts, definitions, formulas/steps and five likely exam questions.",
  "important-questions": "Create 10 important likely exam questions from these notes, grouped into short-answer and long-answer questions.",
  mcqs: "Create 10 MCQs from these notes. Include four options, the correct option, and a one-line explanation for every question.",
  flashcards: "Create 15 concise flashcards. Use exactly this format: Question: ... Answer: ...",
};

export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params; if (!prompts[type]) return NextResponse.json({ error: "Unknown study tool." }, { status: 404 });
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { documentId } = await request.json();
  const { data: existing } = await supabase.from("study_generations").select("content").eq("document_id", documentId).eq("user_id", user.id).eq("type", type.replace("-", "_")) .maybeSingle();
  if (existing) return NextResponse.json({ content: existing.content });
  const { data: chunks } = await supabase.from("document_chunks").select("content, page_number").eq("document_id", documentId).eq("user_id", user.id).order("chunk_index").limit(30);
  if (!chunks?.length) return NextResponse.json({ error: "No processed notes found." }, { status: 400 });
  const noteText = chunks.map((chunk) => `[Page ${chunk.page_number}] ${chunk.content}`).join("\n\n").slice(0, 24000);
  const result = await openai.responses.create({ model: "gpt-4.1-mini", instructions: studySystemPrompt, input: `${prompts[type]}\n\nNOTES:\n${noteText}` });
  const content = result.output_text;
  await supabase.from("study_generations").upsert({ document_id: documentId, user_id: user.id, type: type.replace("-", "_"), content }, { onConflict: "document_id,type" });
  return NextResponse.json({ content });
}
