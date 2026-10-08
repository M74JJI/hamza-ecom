"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function SignInForm() {
  const callbackUrl = useSearchParams().get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const data = new FormData(event.currentTarget);
      data.append("callbackUrl", callbackUrl);
      const response = await fetch("/auth/signin", { method: "POST", body: data });
      if (response.redirected) {
        window.location.href = response.url;
        return;
      }
      const body = await response.json().catch(() => null);
      if (!response.ok) setError(body?.error || "Invalid email or password.");
    } catch {
      setError("Could not reach server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
      <div>
        <label htmlFor="signin-email" className="mb-2 block text-sm font-medium text-neutral-800">Email address</label>
        <input id="signin-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="hz-field" />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="signin-password" className="text-sm font-medium text-neutral-800">Password</label>
          <Link href="/forgot-password" className="text-xs font-semibold text-neutral-600 hover:text-neutral-950">Forgot password?</Link>
        </div>
        <div className="relative">
          <input id="signin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Your password" className="hz-field pr-11" />
          <button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-neutral-400 hover:text-neutral-700" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-600"><input type="checkbox" name="remember" className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950" />Remember me</label>
      <button type="submit" disabled={loading} className="hz-primary-button w-full disabled:cursor-not-allowed disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm text-neutral-600">New here? <Link href="/signup" className="font-semibold text-neutral-950 underline-offset-4 hover:underline">Create account</Link></p>
    </form>
  );
}
