import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "./signup-form";

export default function SignUp() {
  return (
    <AuthShell eyebrow="CREATE ACCOUNT" title="A faster path through checkout." description="Save delivery details, follow orders, keep a wishlist, and manage reviews from one account.">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">Create account</h2>
        <p className="mt-2 text-sm text-neutral-500">Verification link will be sent to your email.</p>
      </div>
      <SignUpForm />
    </AuthShell>
  );
}
