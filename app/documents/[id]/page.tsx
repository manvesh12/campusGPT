import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudyRoom } from "@/components/study-room";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: document } = await supabase.from("documents").select("id,name,processing_status").eq("id", id).eq("user_id", user.id).single();
  if (!document) notFound();
  if (document.processing_status !== "ready") return <main className="mx-auto max-w-xl p-10"><Link href="/dashboard" className="font-semibold text-blue-600">← Dashboard</Link><h1 className="mt-8 text-2xl font-bold">Your notes are still processing</h1><p className="mt-2 text-slate-600">Refresh the dashboard in a moment, or upload a different text-based PDF.</p></main>;
  return <><div className="border-b border-slate-200 bg-white px-5 py-3"><Link href="/dashboard" className="text-sm font-semibold text-blue-600">← Back to dashboard</Link></div><StudyRoom documentId={document.id} documentName={document.name} /></>;
}
