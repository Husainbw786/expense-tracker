"use server";

import { db } from "@/db";
import {
  families,
  members,
  trips,
  tripParticipants,
  expenses,
  expenseParticipants,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------- Families (roster) ----------
export async function addFamily(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (name) {
    await db.insert(families).values({ name });
    revalidateAll();
  }
}

export async function deleteFamily(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await db.delete(families).where(eq(families.id, id));
    revalidateAll();
  }
}

// ---------- Members (roster) ----------
export async function addMember(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const familyId = Number(formData.get("familyId"));
  if (name && familyId) {
    await db.insert(members).values({ name, familyId });
    revalidateAll();
  }
}

export async function deleteMember(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await db.delete(members).where(eq(members.id, id));
    revalidateAll();
  }
}

// ---------- Trips ----------
export async function createTrip(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim() || null;
  if (!name) return;
  const [t] = await db
    .insert(trips)
    .values({ name, startDate, createdAt: new Date() })
    .returning({ id: trips.id });
  revalidateAll();
  redirect(`/trips/${t.id}/members`);
}

export async function deleteTrip(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await db.delete(trips).where(eq(trips.id, id));
    revalidateAll();
  }
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

export async function addMemberToTrip(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const memberId = Number(formData.get("memberId"));
  if (!tripId || !memberId) return;
  const existing = await memberIdsOnTrip(tripId);
  if (!existing.has(memberId)) {
    await db.insert(tripParticipants).values({ tripId, memberId });
    revalidateAll();
  }
}

export async function removeMemberFromTrip(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const memberId = Number(formData.get("memberId"));
  if (!tripId || !memberId) return;
  await db
    .delete(tripParticipants)
    .where(
      and(
        eq(tripParticipants.tripId, tripId),
        eq(tripParticipants.memberId, memberId)
      )
    );
  revalidateAll();
}

export async function addFamilyToTrip(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const familyId = Number(formData.get("familyId"));
  if (!tripId || !familyId) return;
  const fmembers = await db
    .select()
    .from(members)
    .where(eq(members.familyId, familyId));
  const existing = await memberIdsOnTrip(tripId);
  const toAdd = fmembers
    .filter((m) => !existing.has(m.id))
    .map((m) => ({ tripId, memberId: m.id }));
  if (toAdd.length > 0) {
    await db.insert(tripParticipants).values(toAdd);
    revalidateAll();
  }
}

export async function removeFamilyFromTrip(formData: FormData) {
  const tripId = Number(formData.get("tripId"));
  const familyId = Number(formData.get("familyId"));
  if (!tripId || !familyId) return;
  const fmembers = await db
    .select()
    .from(members)
    .where(eq(members.familyId, familyId));
  for (const m of fmembers) {
    await db
      .delete(tripParticipants)
      .where(
        and(
          eq(tripParticipants.tripId, tripId),
          eq(tripParticipants.memberId, m.id)
        )
      );
  }
  revalidateAll();
}

// ---------- Expenses (scoped to a trip) ----------
function parseParticipants(formData: FormData): { memberId: number; units: number }[] {
  // Form sends pairs: participants=memberId and participant_units_<memberId>=units
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
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const paidBy = Number(formData.get("paidBy"));
  const category = String(formData.get("category") ?? "Other").trim() || "Other";
  const spentOn = String(formData.get("spentOn") ?? "").trim() || null;
  const participantIds = parseParticipants(formData);


  if (
    !tripId ||
    !description ||
    !amount ||
    amount <= 0 ||
    !paidBy ||
    participantIds.length === 0
  ) {
    return;
  }

  const [inserted] = await db
    .insert(expenses)
    .values({
      tripId,
      description,
      amount,
      paidBy,
      category,
      spentOn,
      createdAt: new Date(),
    })
    .returning({ id: expenses.id });

  await db
    .insert(expenseParticipants)
    .values(participantIds.map((p) => ({ expenseId: inserted.id, memberId: p.memberId, units: p.units })));

  revalidateAll();
  redirect(`/trips/${tripId}/expenses`);
}

export async function updateExpense(formData: FormData) {
  const id = Number(formData.get("id"));
  const tripId = Number(formData.get("tripId"));
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const paidBy = Number(formData.get("paidBy"));
  const category = String(formData.get("category") ?? "Other").trim() || "Other";
  const spentOn = String(formData.get("spentOn") ?? "").trim() || null;
  const participantIds = parseParticipants(formData);


  if (
    !id ||
    !tripId ||
    !description ||
    !amount ||
    amount <= 0 ||
    !paidBy ||
    participantIds.length === 0
  ) {
    return;
  }

  await db
    .update(expenses)
    .set({ description, amount, paidBy, category, spentOn })
    .where(eq(expenses.id, id));

  await db.delete(expenseParticipants).where(eq(expenseParticipants.expenseId, id));
  await db
    .insert(expenseParticipants)
    .values(participantIds.map((p) => ({ expenseId: id, memberId: p.memberId, units: p.units })));

  revalidateAll();
  redirect(`/trips/${tripId}/expenses`);
}

export async function deleteExpense(formData: FormData) {
  const id = Number(formData.get("id"));
  if (id) {
    await db.delete(expenses).where(eq(expenses.id, id));
    revalidateAll();
  }
}
