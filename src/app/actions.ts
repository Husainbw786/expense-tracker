"use server";

import { randomBytes } from "crypto";
import { db } from "@/db";
import {
  users,
  families,
  members,
  trips,
  tripParticipants,
  tripCollaborators,
  tripInvites,
  expenses,
  expenseParticipants,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, requireTripAccess, getTripRole } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { formatMoney } from "@/lib/calc";

function revalidateAll() {
  revalidatePath("/", "layout");
}

// Ensure the current user owns a roster family.
async function assertOwnsFamily(familyId: number, userId: number) {
  const [f] = await db
    .select({ ownerId: families.ownerId })
    .from(families)
    .where(eq(families.id, familyId))
    .limit(1);
  if (!f || f.ownerId !== userId) throw new Error("Not authorized");
}

// ---------- Families (roster, owned by the current user) ----------
export async function addFamily(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name) {
    await db.insert(families).values({ name, ownerId: user.id });
    revalidateAll();
  }
}

export async function deleteFamily(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (id) {
    await assertOwnsFamily(id, user.id);
    await db.delete(families).where(eq(families.id, id));
    revalidateAll();
  }
}

// ---------- Members (roster) ----------
export async function addMember(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const familyId = Number(formData.get("familyId"));
  if (name && familyId) {
    await assertOwnsFamily(familyId, user.id);
    await db.insert(members).values({ name, familyId });
    revalidateAll();
  }
}

export async function deleteMember(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (!id) return;
  const [m] = await db.select().from(members).where(eq(members.id, id)).limit(1);
  if (!m) return;
  await assertOwnsFamily(m.familyId, user.id);
  await db.delete(members).where(eq(members.id, id));
  revalidateAll();
}

// ---------- Trips ----------
export async function createTrip(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim() || null;
  if (!name) return;
  const [t] = await db
    .insert(trips)
    .values({ name, startDate, createdAt: new Date(), ownerId: user.id })
    .returning({ id: trips.id });
  await db.insert(tripCollaborators).values({
    tripId: t.id,
    userId: user.id,
    role: "owner",
    createdAt: new Date(),
  });
  await logActivity({
    tripId: t.id,
    userId: user.id,
    actorName: user.name,
    action: "trip.created",
    summary: `created the trip "${name}"`,
  });
  revalidateAll();
  redirect(`/trips/${t.id}/members`);
}

export async function deleteTrip(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await requireTripAccess(id, "owner");
  await db.delete(trips).where(eq(trips.id, id));
  revalidateAll();
  redirect("/");
}

// ---------- Trip membership ----------
async function memberIdsOnTrip(tripId: number): Promise<Set<number>> {
  const parts = await db
    .select()
    .from(tripParticipants)
    .where(eq(tripParticipants.tripId, tripId));
  return new Set(parts.map((p) => p.memberId));
}

async function memberName(memberId: number): Promise<string> {
  const [m] = await db.select({ name: members.name }).from(members).where(eq(members.id, memberId)).limit(1);
  return m?.name ?? "someone";
}

export async function addMemberToTrip(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const memberId = Number(formData.get("memberId"));
  if (!tripId || !memberId) return;
  const { user } = await requireTripAccess(tripId, "editor");
  const existing = await memberIdsOnTrip(tripId);
  if (!existing.has(memberId)) {
    await db.insert(tripParticipants).values({ tripId, memberId });
    await logActivity({
      tripId, userId: user.id, actorName: user.name,
      action: "member.added", summary: `added ${await memberName(memberId)} to the trip`,
    });
    revalidateAll();
  }
}

export async function removeMemberFromTrip(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const memberId = Number(formData.get("memberId"));
  if (!tripId || !memberId) return;
  const { user } = await requireTripAccess(tripId, "editor");
  await db
    .delete(tripParticipants)
    .where(and(eq(tripParticipants.tripId, tripId), eq(tripParticipants.memberId, memberId)));
  await logActivity({
    tripId, userId: user.id, actorName: user.name,
    action: "member.removed", summary: `removed ${await memberName(memberId)} from the trip`,
  });
  revalidateAll();
}

export async function addFamilyToTrip(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const familyId = Number(formData.get("familyId"));
  if (!tripId || !familyId) return;
  const { user } = await requireTripAccess(tripId, "editor");
  const fmembers = await db.select().from(members).where(eq(members.familyId, familyId));
  const existing = await memberIdsOnTrip(tripId);
  const toAdd = fmembers.filter((m) => !existing.has(m.id)).map((m) => ({ tripId, memberId: m.id }));
  if (toAdd.length > 0) {
    await db.insert(tripParticipants).values(toAdd);
    const [fam] = await db.select({ name: families.name }).from(families).where(eq(families.id, familyId)).limit(1);
    await logActivity({
      tripId, userId: user.id, actorName: user.name,
      action: "family.added", summary: `added the ${fam?.name ?? "family"} (${toAdd.length} people) to the trip`,
    });
    revalidateAll();
  }
}

export async function removeFamilyFromTrip(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const familyId = Number(formData.get("familyId"));
  if (!tripId || !familyId) return;
  const { user } = await requireTripAccess(tripId, "editor");
  const fmembers = await db.select().from(members).where(eq(members.familyId, familyId));
  for (const m of fmembers) {
    await db
      .delete(tripParticipants)
      .where(and(eq(tripParticipants.tripId, tripId), eq(tripParticipants.memberId, m.id)));
  }
  const [fam] = await db.select({ name: families.name }).from(families).where(eq(families.id, familyId)).limit(1);
  await logActivity({
    tripId, userId: user.id, actorName: user.name,
    action: "family.removed", summary: `removed the ${fam?.name ?? "family"} from the trip`,
  });
  revalidateAll();
}

// ---------- Expenses ----------
function parseParticipants(formData: FormData): { memberId: number; units: number }[] {
  return formData
    .getAll("participants")
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((memberId) => ({
      memberId,
      units: Math.max(1, Number(formData.get(`participant_units_${memberId}`)) || 1),
    }));
}

export async function addExpense(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  if (!tripId) return;
  const { user } = await requireTripAccess(tripId, "editor");

  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const paidBy = Number(formData.get("paidBy"));
  const category = String(formData.get("category") ?? "Other").trim() || "Other";
  const spentOn = String(formData.get("spentOn") ?? "").trim() || null;
  const participantIds = parseParticipants(formData);

  if (!description || !amount || amount <= 0 || !paidBy || participantIds.length === 0) return;

  const [inserted] = await db
    .insert(expenses)
    .values({ tripId, description, amount, paidBy, category, spentOn, createdAt: new Date() })
    .returning({ id: expenses.id });

  await db
    .insert(expenseParticipants)
    .values(participantIds.map((p) => ({ expenseId: inserted.id, memberId: p.memberId, units: p.units })));

  await logActivity({
    tripId, userId: user.id, actorName: user.name,
    action: "expense.added", summary: `added expense "${description}" (${formatMoney(amount)})`,
  });
  revalidateAll();
  redirect(`/trips/${tripId}/expenses`);
}

export async function updateExpense(formData: FormData) {
  const id = Number(formData.get("id"));
  const tripId = Number(formData.get("tripId"));
  if (!id || !tripId) return;
  const { user } = await requireTripAccess(tripId, "editor");

  // IDOR guard: the expense must belong to this trip.
  const [existing] = await db.select({ tripId: expenses.tripId }).from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!existing || existing.tripId !== tripId) return;

  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const paidBy = Number(formData.get("paidBy"));
  const category = String(formData.get("category") ?? "Other").trim() || "Other";
  const spentOn = String(formData.get("spentOn") ?? "").trim() || null;
  const participantIds = parseParticipants(formData);

  if (!description || !amount || amount <= 0 || !paidBy || participantIds.length === 0) return;

  await db.update(expenses).set({ description, amount, paidBy, category, spentOn }).where(eq(expenses.id, id));
  await db.delete(expenseParticipants).where(eq(expenseParticipants.expenseId, id));
  await db
    .insert(expenseParticipants)
    .values(participantIds.map((p) => ({ expenseId: id, memberId: p.memberId, units: p.units })));

  await logActivity({
    tripId, userId: user.id, actorName: user.name,
    action: "expense.updated", summary: `edited expense "${description}" (${formatMoney(amount)})`,
  });
  revalidateAll();
  redirect(`/trips/${tripId}/expenses`);
}

export async function deleteExpense(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  const [e] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!e) return;
  const { user } = await requireTripAccess(e.tripId, "editor");
  await db.delete(expenses).where(eq(expenses.id, id));
  await logActivity({
    tripId: e.tripId, userId: user.id, actorName: user.name,
    action: "expense.deleted", summary: `deleted expense "${e.description}" (${formatMoney(e.amount)})`,
  });
  revalidateAll();
}

// ---------- Invites & collaborators ----------
export async function createInvite(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const role = String(formData.get("role") ?? "viewer") === "editor" ? "editor" : "viewer";
  if (!tripId) return;
  const { user } = await requireTripAccess(tripId, "owner");
  const token = randomBytes(16).toString("base64url");
  await db.insert(tripInvites).values({
    token, tripId, role, createdById: user.id, active: true, createdAt: new Date(),
  });
  revalidateAll();
}

// Add someone directly by email (if they already have an account).
export async function addCollaboratorByEmail(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "viewer") === "editor" ? "editor" : "viewer";
  if (!tripId || !email) return;
  const { user: owner } = await requireTripAccess(tripId, "owner");
  const back = `/trips/${tripId}/collaborators`;

  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) {
    redirect(`${back}?notfound=${encodeURIComponent(email)}`);
  }

  const existing = await getTripRole(tripId, u.id);
  if (existing === "owner") {
    redirect(`${back}?msg=${encodeURIComponent(u.name + " is the owner")}`);
  }
  if (existing) {
    await db
      .update(tripCollaborators)
      .set({ role })
      .where(and(eq(tripCollaborators.tripId, tripId), eq(tripCollaborators.userId, u.id)));
    revalidateAll();
    redirect(`${back}?updated=${encodeURIComponent(u.name)}`);
  }

  await db.insert(tripCollaborators).values({ tripId, userId: u.id, role, createdAt: new Date() });
  await logActivity({
    tripId, userId: owner.id, actorName: owner.name,
    action: "collaborator.added", summary: `gave ${u.name} ${role} access (by email)`,
  });
  revalidateAll();
  redirect(`${back}?added=${encodeURIComponent(u.name)}`);
}

export async function revokeInvite(formData: FormData) {
  const inviteId = Number(formData.get("inviteId"));
  const tripId = Number(formData.get("tripId"));
  if (!inviteId || !tripId) return;
  await requireTripAccess(tripId, "owner");
  await db.update(tripInvites).set({ active: false }).where(eq(tripInvites.id, inviteId));
  revalidateAll();
}

export async function acceptInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return;
  const user = await requireUser();

  const [inv] = await db
    .select()
    .from(tripInvites)
    .where(and(eq(tripInvites.token, token), eq(tripInvites.active, true)))
    .limit(1);
  if (!inv) redirect("/");

  const existingRole = await getTripRole(inv.tripId, user.id);
  if (!existingRole) {
    await db.insert(tripCollaborators).values({
      tripId: inv.tripId, userId: user.id, role: inv.role, createdAt: new Date(),
    });
    await logActivity({
      tripId: inv.tripId, userId: user.id, actorName: user.name,
      action: "member.joined", summary: `joined the trip as ${inv.role}`,
    });
    revalidateAll();
  }
  redirect(`/trips/${inv.tripId}`);
}

export async function removeCollaborator(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const userId = Number(formData.get("userId"));
  if (!tripId || !userId) return;
  await requireTripAccess(tripId, "owner");
  // never remove the owner
  const [t] = await db.select({ ownerId: trips.ownerId }).from(trips).where(eq(trips.id, tripId)).limit(1);
  if (t?.ownerId === userId) return;
  await db
    .delete(tripCollaborators)
    .where(and(eq(tripCollaborators.tripId, tripId), eq(tripCollaborators.userId, userId)));
  revalidateAll();
}

export async function setCollaboratorRole(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const userId = Number(formData.get("userId"));
  const role = String(formData.get("role") ?? "viewer") === "editor" ? "editor" : "viewer";
  if (!tripId || !userId) return;
  await requireTripAccess(tripId, "owner");
  const [t] = await db.select({ ownerId: trips.ownerId }).from(trips).where(eq(trips.id, tripId)).limit(1);
  if (t?.ownerId === userId) return; // can't change owner's role
  await db
    .update(tripCollaborators)
    .set({ role })
    .where(and(eq(tripCollaborators.tripId, tripId), eq(tripCollaborators.userId, userId)));
  revalidateAll();
}
