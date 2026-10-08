"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/auth/reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const body = await response.json().catch(() => null);
      if (!response.ok) setError(body?.error || "Could not send reset email.");
      else setSuccess(true);
    } catch {
      setError("Could not reach server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="ACCOUNT RECOVERY" title="Reset your password." description="Enter account email. We will send a time-limited reset link if account exists.">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">Password recovery</h2>
      {success ? (
        <div className="py-10 text-center"><CheckCircle className="mx-auto h-10 w-10 text-emerald-600" /><h3 className="mt-5 text-xl font-semibold">Check your inbox</h3><p className="mt-3 text-sm leading-6 text-neutral-600">If account exists, reset instructions are on their way.</p><Link href="/signin" className="hz-secondary-button mt-7">Back to sign in</Link></div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
          <div><label htmlFor="recovery-email" className="mb-2 block text-sm font-medium text-neutral-800">Email address</label><input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" className="hz-field" /></div>
          <button type="submit" disabled={loading} className="hz-primary-button w-full disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? "Sending…" : "Send reset link"}</button>
          <p className="text-center text-sm text-neutral-600"><Link href="/signin" className="font-semibold text-neutral-950 underline-offset-4 hover:underline">Return to sign in</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
