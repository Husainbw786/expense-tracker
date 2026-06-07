import { db } from "@/db";
import {
  families,
  members,
  trips,
  tripParticipants,
  tripCollaborators,
  tripInvites,
  users,
  expenses,
  expenseParticipants,
  type Role,
} from "@/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import {
  buildSummary,
  type ExpenseInput,
  type FamilyInput,
  type MemberInput,
  type Summary,
} from "./calc";

// ---------- Roster (scoped to the owning user) ----------
export async function getFamilies(ownerId: number) {
  return db
    .select()
    .from(families)
    .where(eq(families.ownerId, ownerId))
    .orderBy(families.name);
}

export async function getMembersWithFamily(ownerId: number) {
  const fs = await getFamilies(ownerId);
  if (fs.length === 0) return [];
  const famIds = fs.map((f) => f.id);
  const ms = await db.select().from(members).where(inArray(members.familyId, famIds));
  const famName = new Map(fs.map((f) => [f.id, f.name]));
  return ms
    .map((m) => ({ ...m, familyName: famName.get(m.familyId) ?? "—" }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ---------- Trips (scoped to the current user's collaborations) ----------
export type TripCard = {
  id: number;
  name: string;
  startDate: string | null;
  memberCount: number;
  total: number;
  role: Role;
};

export async function getTrips(userId: number): Promise<TripCard[]> {
  const rows = await db
    .select({ trip: trips, role: tripCollaborators.role })
    .from(tripCollaborators)
    .innerJoin(trips, eq(tripCollaborators.tripId, trips.id))
    .where(eq(tripCollaborators.userId, userId))
    .orderBy(desc(trips.createdAt));

  if (rows.length === 0) return [];
  const tripIds = rows.map((r) => r.trip.id);

  const exps = await db
    .select({ tripId: expenses.tripId, amount: expenses.amount })
    .from(expenses)
    .where(inArray(expenses.tripId, tripIds));
  const parts = await db
    .select({ tripId: tripParticipants.tripId })
    .from(tripParticipants)
    .where(inArray(tripParticipants.tripId, tripIds));

  const totalByTrip = new Map<number, number>();
  for (const e of exps) totalByTrip.set(e.tripId, (totalByTrip.get(e.tripId) ?? 0) + e.amount);
  const countByTrip = new Map<number, number>();
  for (const p of parts) countByTrip.set(p.tripId, (countByTrip.get(p.tripId) ?? 0) + 1);

  return rows.map((r) => ({
    id: r.trip.id,
    name: r.trip.name,
    startDate: r.trip.startDate,
    memberCount: countByTrip.get(r.trip.id) ?? 0,
    total: totalByTrip.get(r.trip.id) ?? 0,
    role: r.role as Role,
  }));
}

export async function getTrip(tripId: number) {
  const [t] = await db.select().from(trips).where(eq(trips.id, tripId));
  return t ?? null;
}

// members currently on a trip, with family name (owner-agnostic: trip-scoped)
export async function getTripMembers(tripId: number) {
  const parts = await db
    .select()
    .from(tripParticipants)
    .where(eq(tripParticipants.tripId, tripId));
  const memberIds = parts.map((p) => p.memberId);
  if (memberIds.length === 0) return [];
  const ms = await db.select().from(members).where(inArray(members.id, memberIds));
  const famIds = [...new Set(ms.map((m) => m.familyId))];
  const fs = famIds.length
    ? await db.select().from(families).where(inArray(families.id, famIds))
    : [];
  const famName = new Map(fs.map((f) => [f.id, f.name]));
  return ms
    .map((m) => ({ ...m, familyName: famName.get(m.familyId) ?? "—" }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// roster (the TRIP OWNER's roster) with onTrip flags — for the "add people" screen
export async function getTripRoster(tripId: number) {
  const trip = await getTrip(tripId);
  const ownerId = trip?.ownerId;
  const parts = await db
    .select()
    .from(tripParticipants)
    .where(eq(tripParticipants.tripId, tripId));
  const onTrip = new Set(parts.map((p) => p.memberId));
  const fs = ownerId ? await getFamilies(ownerId) : [];
  const ms = ownerId ? await getMembersWithFamily(ownerId) : [];
  return fs.map((f) => {
    const fmembers = ms.filter((m) => m.familyId === f.id);
    return {
      family: f,
      members: fmembers.map((m) => ({ ...m, onTrip: onTrip.has(m.id) })),
      allOn: fmembers.length > 0 && fmembers.every((m) => onTrip.has(m.id)),
    };
  });
}

async function participantsByExpense(tripId: number) {
  const exps = await db.select().from(expenses).where(eq(expenses.tripId, tripId));
  const expenseIds = exps.map((e) => e.id);
  const parts = expenseIds.length
    ? await db
        .select()
        .from(expenseParticipants)
        .where(inArray(expenseParticipants.expenseId, expenseIds))
    : [];
  const map = new Map<number, { memberId: number; units: number }[]>();
  for (const p of parts) {
    const arr = map.get(p.expenseId) ?? [];
    arr.push({ memberId: p.memberId, units: p.units ?? 1 });
    map.set(p.expenseId, arr);
  }
  return { exps, map };
}

export type ExpenseWithDetails = {
  id: number;
  description: string;
  category: string;
  amount: number;
  spentOn: string | null;
  payerName: string;
  payerId: number;
  participants: { memberId: number; units: number }[];
  participantCount: number;
  totalUnits: number;
};

export async function getTripExpensesWithDetails(
  tripId: number
): Promise<ExpenseWithDetails[]> {
  const { exps, map } = await participantsByExpense(tripId);
  const ms = await db.select().from(members);
  const memberName = new Map(ms.map((m) => [m.id, m.name]));

  return exps
    .map((e) => {
      const participants = map.get(e.id) ?? [];
      const totalUnits = participants.reduce((s, p) => s + p.units, 0);
      return {
        id: e.id,
        description: e.description,
        category: e.category,
        amount: e.amount,
        spentOn: e.spentOn,
        payerName: memberName.get(e.paidBy) ?? "—",
        payerId: e.paidBy,
        participants,
        participantCount: participants.length,
        totalUnits,
      };
    })
    .sort((a, b) => b.id - a.id);
}

export async function getTripSummary(tripId: number): Promise<Summary> {
  const tripMembers = (await getTripMembers(tripId)) as MemberInput[];
  const presentFamilyIds = [...new Set(tripMembers.map((m) => m.familyId))];
  const fs = (presentFamilyIds.length
    ? await db.select().from(families).where(inArray(families.id, presentFamilyIds))
    : []) as FamilyInput[];

  const { exps, map } = await participantsByExpense(tripId);
  const expenseInputs: ExpenseInput[] = exps.map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount,
    paidBy: e.paidBy,
    participants: map.get(e.id) ?? [],
  }));

  return buildSummary(fs, tripMembers, expenseInputs);
}

export async function getExpenseById(id: number) {
  const [e] = await db.select().from(expenses).where(eq(expenses.id, id));
  if (!e) return null;
  const parts = await db
    .select()
    .from(expenseParticipants)
    .where(eq(expenseParticipants.expenseId, id));
  return {
    ...e,
    participants: parts.map((p) => ({ memberId: p.memberId, units: p.units ?? 1 })),
  };
}

// ---------- Collaborators & invites ----------
export async function getTripCollaborators(tripId: number) {
  return db
    .select({
      id: tripCollaborators.id,
      userId: tripCollaborators.userId,
      role: tripCollaborators.role,
      name: users.name,
      email: users.email,
      createdAt: tripCollaborators.createdAt,
    })
    .from(tripCollaborators)
    .innerJoin(users, eq(tripCollaborators.userId, users.id))
    .where(eq(tripCollaborators.tripId, tripId))
    .orderBy(tripCollaborators.createdAt);
}

export async function getTripInvites(tripId: number) {
  return db
    .select()
    .from(tripInvites)
    .where(and(eq(tripInvites.tripId, tripId), eq(tripInvites.active, true)))
    .orderBy(desc(tripInvites.createdAt));
}

export async function getInviteByToken(token: string) {
  const [inv] = await db
    .select({
      id: tripInvites.id,
      token: tripInvites.token,
      tripId: tripInvites.tripId,
      role: tripInvites.role,
      active: tripInvites.active,
      tripName: trips.name,
    })
    .from(tripInvites)
    .innerJoin(trips, eq(tripInvites.tripId, trips.id))
    .where(eq(tripInvites.token, token))
    .limit(1);
  return inv ?? null;
}
