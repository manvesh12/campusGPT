"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const result = signup
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: data.get("fullName"), college_name: data.get("college") } },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) setError(result.error.message);
    else if (signup && !result.data.session) setError("Check your email to confirm your account, then sign in.");
    else router.replace("/dashboard");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-lg font-bold text-blue-600">StudySathi AI</Link>
        <h1 className="mt-8 text-3xl font-bold text-slate-950">{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-slate-500">{signup ? "Start building your personal study room." : "Sign in to continue studying."}</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          {signup && <><Input name="fullName" label="Full name" placeholder="Rahul Sharma" required /><Input name="college" label="College" placeholder="Your college name" /></>}
          <Input name="email" label="Email" placeholder="you@college.edu" type="email" required />
          <Input name="password" label="Password" placeholder="At least 6 characters" type="password" minLength={6} required />
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">{signup ? "Already have an account?" : "New to StudySathi?"} <Link className="font-semibold text-blue-600" href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}</Link></p>
      </div>
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block text-sm font-medium text-slate-700"><span className="mb-1.5 block">{label}</span><input {...props} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>;
}
