"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string; sources?: number[] };
const tools = ["Chat", "Summary", "Important Qs", "MCQs", "Flashcards"] as const;

export function StudyRoom({ documentId, documentName }: { documentId: string; documentName: string }) {
  const [activeTool, setActiveTool] = useState<(typeof tools)[number]>("Chat");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: `I’ve read ${documentName}. Ask me anything from these notes in English, Hindi, or Hinglish.` }]);
  const [question, setQuestion] = useState(""); const [loading, setLoading] = useState(false);
  async function ask(event: FormEvent) {
    event.preventDefault(); if (!question.trim() || loading) return;
    const value = question.trim(); setQuestion(""); setMessages((items) => [...items, { role: "user", content: value }]); setLoading(true);
    const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId, question: value }) });
    const data = await response.json();
    setMessages((items) => [...items, { role: "assistant", content: data.answer || data.error || "I couldn’t answer that right now.", sources: data.sources?.map((source: { page: number }) => source.page) }]); setLoading(false);
  }
  return <div className="flex min-h-[calc(100vh-73px)] bg-slate-50">
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block"><p className="px-3 text-xs font-bold uppercase tracking-widest text-slate-400">Study tools</p><div className="mt-3 space-y-1">{tools.map((tool) => <button key={tool} onClick={() => setActiveTool(tool)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${activeTool === tool ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>{tool}</button>)}</div></aside>
    <section className="flex min-w-0 flex-1 flex-col"><div className="border-b border-slate-200 bg-white px-5 py-4"><p className="text-sm text-slate-500">Study room</p><h1 className="truncate text-lg font-bold text-slate-950">{documentName}</h1></div>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">{activeTool !== "Chat" ? <GenerationTool label={activeTool} documentId={documentId} /> : messages.map((message, index) => <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"}`}><p className="whitespace-pre-wrap">{message.content}</p>{message.sources?.length ? <p className="mt-3 text-xs font-semibold text-blue-600">Sources: {message.sources.map((page) => `Page ${page}`).join(", ")}</p> : null}</div></div>)}{loading && <p className="text-sm text-slate-500">StudySathi is thinking…</p>}</div>
      {activeTool === "Chat" && <form onSubmit={ask} className="border-t border-slate-200 bg-white p-4"><div className="mx-auto flex max-w-3xl gap-2"><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask from your notes…" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /><button className="rounded-xl bg-blue-600 px-5 font-semibold text-white disabled:opacity-50" disabled={loading}>Send</button></div></form>}</section>
  </div>;
}

function GenerationTool({ label, documentId }: { label: string; documentId: string }) {
  const [value, setValue] = useState(""); const [loading, setLoading] = useState(false);
  async function generate() { setLoading(true); const type = label === "Important Qs" ? "important-questions" : label.toLowerCase(); const res = await fetch(`/api/study/${type}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId }) }); const data = await res.json(); setValue(data.content || data.error || "Could not generate this yet."); setLoading(false); }
  return <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-950">{label}</h2><p className="mt-1 text-sm text-slate-500">Generate this from your uploaded notes.</p><button onClick={generate} disabled={loading} className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Generating…" : `Generate ${label}`}</button>{value && <pre className="mt-6 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-6 text-slate-800">{value}</pre>}</div>;
}
