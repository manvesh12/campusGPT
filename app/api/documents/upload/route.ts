import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_FILE_SIZE } from "@/lib/document";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const data = await request.formData(); const file = data.get("file");
  if (!(file instanceof File) || file.type !== "application/pdf") return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "PDF must be 10 MB or smaller." }, { status: 400 });
  const id = crypto.randomUUID(); const path = `${user.id}/${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error: storageError } = await supabase.storage.from("documents").upload(path, file, { contentType: "application/pdf", upsert: false });
  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 400 });
  const { data: document, error } = await supabase.from("documents").insert({ id, user_id: user.id, name: file.name, storage_path: path, file_size: file.size }).select().single();
  if (error) { await supabase.storage.from("documents").remove([path]); return NextResponse.json({ error: error.message }, { status: 400 }); }
  return NextResponse.json({ document });
}
