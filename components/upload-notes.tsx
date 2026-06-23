"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function UploadNotes() {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Uploading your notes…");
    const body = new FormData(); body.append("file", file);
    const response = await fetch("/api/documents/upload", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) { setStatus(data.error || "Upload failed. Please try again."); return; }
    setStatus("Processing your PDF…");
    const processed = await fetch("/api/documents/process", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId: data.document.id }) });
    if (!processed.ok) { const problem = await processed.json(); setStatus(problem.error || "PDF was uploaded but could not be processed."); return; }
    router.push(`/documents/${data.document.id}`);
    router.refresh();
  }
  return <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 px-6 py-10 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">↑</div>
    <h2 className="mt-4 text-xl font-bold text-slate-950">Create a study room</h2>
    <p className="mt-2 text-sm text-slate-600">Upload a text-based PDF — maximum 10 MB and 50 pages.</p>
    <input ref={input} onChange={upload} accept="application/pdf" className="hidden" type="file" />
    <button onClick={() => input.current?.click()} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">Upload PDF</button>
    {status && <p className="mt-3 text-sm font-medium text-slate-600" role="status">{status}</p>}
  </div>;
}
