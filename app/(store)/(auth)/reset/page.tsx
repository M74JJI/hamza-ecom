"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    if (!token) return setError("Reset link is invalid or incomplete.");
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/auth/reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const body = await response.json().catch(() => null);
      if (!response.ok) setError(body?.error || "Password reset failed.");
      else setSuccess(true);
    } catch {
      setError("Could not reach server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="SECURE RESET" title="Choose a new password." description="Use at least eight characters. Avoid passwords already used on other services.">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">New password</h2>
      {success ? (
        <div className="py-10 text-center"><CheckCircle className="mx-auto h-10 w-10 text-emerald-600" /><h3 className="mt-5 text-xl font-semibold">Password updated</h3><p className="mt-3 text-sm text-neutral-600">Sign in using new password.</p><Link href="/signin" className="hz-primary-button mt-7">Sign in</Link></div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
          <div><label htmlFor="new-password" className="mb-2 block text-sm font-medium text-neutral-800">New password</label><div className="relative"><input id="new-password" type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required autoComplete="new-password" className="hz-field pr-11" /><button type="button" onClick={() => setShow((value) => !value)} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-neutral-400" aria-label={show ? "Hide passwords" : "Show passwords"}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <div><label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-neutral-800">Confirm password</label><input id="confirm-password" type={show ? "text" : "password"} value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={8} required autoComplete="new-password" className="hz-field" /></div>
          <button type="submit" disabled={loading} className="hz-primary-button w-full disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? "Updating…" : "Update password"}</button>
        </form>
      )}
    </AuthShell>
  );
}
