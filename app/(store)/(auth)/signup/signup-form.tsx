"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [complete, setComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/auth/signup", { method: "POST", body: new FormData(event.currentTarget) });
      const body = await response.json().catch(() => null);
      if (!response.ok) setError(body?.error || "Failed to create account. Try again.");
      else setComplete(true);
    } catch {
      setError("Could not reach server. Disable blockers for this site and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (complete) {
    return (
      <div className="py-8 text-center">
        <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-5 text-2xl font-semibold text-neutral-950">Check your email</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-600">If this address can be registered, verification instructions will arrive shortly.</p>
        <Link href="/browse" className="hz-secondary-button mt-7">Browse catalog</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
      <div><label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-neutral-800">Full name</label><input id="signup-name" name="name" autoComplete="name" required placeholder="Your full name" className="hz-field" /></div>
      <div><label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-neutral-800">Email address</label><input id="signup-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="hz-field" /></div>
      <div>
        <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-neutral-800">Password</label>
        <div className="relative">
          <input id="signup-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" className="hz-field pr-11" />
          <button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-neutral-400 hover:text-neutral-700" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="hz-primary-button w-full disabled:cursor-not-allowed disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? "Creating account…" : "Create account"}</button>
      <p className="text-center text-sm text-neutral-600">Already registered? <Link href="/signin" className="font-semibold text-neutral-950 underline-offset-4 hover:underline">Sign in</Link></p>
    </form>
  );
}
