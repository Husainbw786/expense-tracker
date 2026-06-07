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
    <form action={formAction} className="space-y-3">
      {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
      {invite ? <input type="hidden" name="invite" value={invite} /> : null}

      {mode === "signup" && (
        <div>
          <label className="section-label">Your name</label>
          <input name="name" required placeholder="e.g. Husain" className="input" autoComplete="name" />
        </div>
      )}

      <div>
        <label className="section-label">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="input"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="section-label">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          className="input"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>

      {state.error && (
        <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-500 pt-1">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link
              href={`/signup${linkQuery(redirectTo, invite)}`}
              className="text-indigo-600 font-medium"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href={`/login${linkQuery(redirectTo, invite)}`}
              className="text-indigo-600 font-medium"
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
