import "server-only";
import { cache } from "react";
import { redirect, notFound } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, trips, tripCollaborators, type Role } from "@/db/schema";
import { getSessionToken } from "@/lib/session";

export type CurrentUser = { id: number; email: string; name: string };

// Deduped within a single render/request.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

const RANK: Record<Role, number> = { viewer: 0, editor: 1, owner: 2 };

// Non-redirecting: returns the user's role on a trip, or null. For route handlers.
export async function getTripRole(
  tripId: number,
  userId: number
): Promise<Role | null> {
  const rows = await db
    .select({ role: tripCollaborators.role })
    .from(tripCollaborators)
    .where(and(eq(tripCollaborators.tripId, tripId), eq(tripCollaborators.userId, userId)))
    .limit(1);
  if (rows[0]) return rows[0].role as Role;

  // Fallback: owner column is authoritative even if collaborator row is missing.
  const t = await db
    .select({ ownerId: trips.ownerId })
    .from(trips)
    .where(eq(trips.id, tripId))
    .limit(1);
  if (t[0]?.ownerId === userId) return "owner";
  return null;
}

// Redirecting guard for pages and server actions.
export async function requireTripAccess(
  tripId: number,
  minRole: Role
): Promise<{ user: CurrentUser; role: Role }> {
  const user = await requireUser();
  const role = await getTripRole(tripId, user.id);
  if (!role) notFound();
  if (RANK[role] < RANK[minRole]) notFound();
  return { user, role };
}

export function canWrite(role: Role): boolean {
  return RANK[role] >= RANK.editor;
}
