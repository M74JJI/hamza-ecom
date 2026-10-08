import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "./signin-form";

export default function SignIn() {
  return (
    <AuthShell eyebrow="WELCOME BACK" title="Sign in to your account." description="Access saved addresses, order history, wishlist, reviews, and security settings.">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">Sign in</h2>
        <p className="mt-2 text-sm text-neutral-500">Use email and password registered with HAMZA.</p>
      </div>
      <SignInForm />
      <p className="mt-6 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-600"><Link href="/forgot-password" className="font-semibold text-neutral-950 underline-offset-4 hover:underline">Forgot password?</Link></p>
    </AuthShell>
  );
}
