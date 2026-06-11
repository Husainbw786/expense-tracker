"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/app/auth/actions";

export default function AuthForm({
  mode,
  redirectTo,
  invite,
}: {
  mode: "login" | "signup";
  redirectTo?: string;
  invite?: string;
}) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
      {invite ? <input type="hidden" name="invite" value={invite} /> : null}

      {mode === "signup" && (
        <label className="flex flex-col gap-1.5">
          <span className="ts-eyebrow">Your name</span>
          <input name="name" required placeholder="e.g. Husain" className="input" autoComplete="name" />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="ts-eyebrow">Email</span>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="input"
          autoComplete="email"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="ts-eyebrow">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          className="input"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>

      {state.error && (
        <p className="border border-rose-border bg-surface-accent px-3.5 py-2.5 text-[0.82rem] tracking-[0.02em] text-rose-ink">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}{" "}
        <span aria-hidden="true">→</span>
      </button>

      <p className="ts-micro pt-1 text-center">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link
              href={`/signup${linkQuery(redirectTo, invite)}`}
              className="ts-textlink ts-textlink--rose"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href={`/login${linkQuery(redirectTo, invite)}`}
              className="ts-textlink ts-textlink--rose"
            >
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function linkQuery(redirectTo?: string, invite?: string): string {
  const p = new URLSearchParams();
  if (invite) p.set("invite", invite);
  else if (redirectTo) p.set("redirect", redirectTo);
  const s = p.toString();
  return s ? `?${s}` : "";
}
