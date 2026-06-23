import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UploadNotes } from "@/components/upload-notes";

export default async function DashboardPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: documents }, { data: profile }] = await Promise.all([
    supabase.from("documents").select("id,name,processing_status,created_at,page_count").order("created_at", { ascending: false }),
    supabase.from("profiles").select("full_name").maybeSingle(),
  ]);
  const name = profile?.full_name || user.user_metadata.full_name || user.email?.split("@")[0] || "Student";
  return <div className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="text-xl font-bold text-blue-600">StudySathi AI</Link><form action="/api/auth/signout" method="post"><button className="text-sm font-semibold text-slate-600 hover:text-slate-950">Sign out</button></form></div></header><main className="mx-auto max-w-6xl px-5 py-10"><h1 className="text-3xl font-bold text-slate-950">Hello, {name} 👋</h1><p className="mt-1 text-slate-500">What are we studying today?</p><div className="mt-8"><UploadNotes /></div><section className="mt-10"><h2 className="text-xl font-bold text-slate-950">Your study rooms</h2>{documents?.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{documents.map((document) => <article key={document.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="truncate font-bold text-slate-900">{document.name}</p><p className="mt-1 text-sm text-slate-500">{document.page_count ? `${document.page_count} pages` : "Preparing your notes"}</p><div className="mt-5 flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${document.processing_status === "ready" ? "bg-emerald-100 text-emerald-700" : document.processing_status === "failed" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>{document.processing_status}</span>{document.processing_status === "ready" ? <Link href={`/documents/${document.id}`} className="text-sm font-bold text-blue-600">Open →</Link> : <span className="text-sm text-slate-400">Not ready</span>}</div></article>)}</div> : <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Your first uploaded PDF will appear here.</p>}</section></main></div>;
}
