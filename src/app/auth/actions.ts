"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";

export type AuthState = { error?: string };

function safeNext(formData: FormData): string {
  const invite = String(formData.get("invite") ?? "").trim();
  if (invite) return `/invite/${encodeURIComponent(invite)}`;
  const redirectTo = String(formData.get("redirect") ?? "").trim();
  // only allow internal paths
  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) return redirectTo;
  return "/";
}

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Please enter your name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) return { error: "An account with this email already exists. Try logging in." };

  const passwordHash = await hashPassword(password);
  const [u] = await db
    .insert(users)
    .values({ name, email, passwordHash, createdAt: new Date() })
    .returning({ id: users.id });

  await createSession(u.id);
  redirect(safeNext(formData));
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Wrong email or password." };
  }

  await createSession(user.id);
  redirect(safeNext(formData));
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
