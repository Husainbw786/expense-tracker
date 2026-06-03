import { db } from "@/db";
import {
  families,
  members,
  trips,
  tripParticipants,
  expenses,
  expenseParticipants,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  buildSummary,
  type ExpenseInput,
  type FamilyInput,
  type MemberInput,
  type Summary,
} from "./calc";

// ---------- Roster (global, reused across trips) ----------
export async function getFamilies() {
  return db.select().from(families).orderBy(families.name);
}

export async function getMembersWithFamily() {
  const ms = await db.select().from(members);
  const fs = await db.select().from(families);
  const famName = new Map(fs.map((f) => [f.id, f.name]));
  return ms
    .map((m) => ({ ...m, familyName: famName.get(m.familyId) ?? "—" }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ---------- Trips ----------
export type TripCard = {
  id: number;
  name: string;
  startDate: string | null;
  memberCount: number;
  total: number;
};

export async function getTrips(): Promise<TripCard[]> {
  const ts = await db.select().from(trips).orderBy(desc(trips.createdAt));
  const exps = await db.select().from(expenses);
  const parts = await db.select().from(tripParticipants);

  const totalByTrip = new Map<number, number>();
  for (const e of exps) {
    totalByTrip.set(e.tripId, (totalByTrip.get(e.tripId) ?? 0) + e.amount);
  }
  const countByTrip = new Map<number, number>();
  for (const p of parts) {
    countByTrip.set(p.tripId, (countByTrip.get(p.tripId) ?? 0) + 1);
  }

  return ts.map((t) => ({
    id: t.id,
    name: t.name,
    startDate: t.startDate,
    memberCount: countByTrip.get(t.id) ?? 0,
    total: totalByTrip.get(t.id) ?? 0,
  }));
}

export async function getTrip(tripId: number) {
  const [t] = await db.select().from(trips).where(eq(trips.id, tripId));
  return t ?? null;
}

// members currently on a trip, with their family name
export async function getTripMembers(tripId: number) {
  const parts = await db
    .select()
    .from(tripParticipants)
    .where(eq(tripParticipants.tripId, tripId));
  const onTrip = new Set(parts.map((p) => p.memberId));
  const all = await getMembersWithFamily();
  return all.filter((m) => onTrip.has(m.id));
}

// roster grouped into who's on the trip vs. who isn't (for the "add people" screen)
export async function getTripRoster(tripId: number) {
  const parts = await db
    .select()
    .from(tripParticipants)
    .where(eq(tripParticipants.tripId, tripId));
  const onTrip = new Set(parts.map((p) => p.memberId));
  const fs = await getFamilies();
  const ms = await getMembersWithFamily();
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
  const exps = await db
    .select()
    .from(expenses)
    .where(eq(expenses.tripId, tripId));
  const parts = await db.select().from(expenseParticipants);
  const map = new Map<number, { memberId: number; units: number }[]>();
  const expenseIds = new Set(exps.map((e) => e.id));
  for (const p of parts) {
    if (!expenseIds.has(p.expenseId)) continue;
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
  const presentFamilyIds = new Set(tripMembers.map((m) => m.familyId));
  const fs = (await getFamilies()).filter((f) =>
    presentFamilyIds.has(f.id)
  ) as FamilyInput[];

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
