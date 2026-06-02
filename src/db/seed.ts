/**
 * Demo data so you can see the app working immediately.
 * Run with: npm run seed
 * Safe to delete this file. You can also clear data from inside the app.
 */
import "dotenv/config";
import { db } from "./index";
import {
  families,
  members,
  trips,
  tripParticipants,
  expenses,
  expenseParticipants,
} from "./schema";

async function main() {
  console.log("Seeding demo data...");

  // wipe existing
  await db.delete(expenseParticipants);
  await db.delete(expenses);
  await db.delete(tripParticipants);
  await db.delete(trips);
  await db.delete(members);
  await db.delete(families);

  // ---- permanent roster ----
  const famData = [
    { name: "My Family", people: ["Husain", "Amina", "Yusuf", "Sara", "Bilal"] },
    { name: "Uncle's Family", people: ["Karim", "Naila", "Imran", "Zoya", "Faiz", "Hena"] },
    { name: "Cousin's Family", people: ["Adil", "Rukhsar", "Sana", "Tariq"] },
  ];

  const memberIds: Record<string, number> = {};
  for (const f of famData) {
    const [fam] = await db
      .insert(families)
      .values({ name: f.name })
      .returning({ id: families.id });
    for (const name of f.people) {
      const [m] = await db
        .insert(members)
        .values({ name, familyId: fam.id })
        .returning({ id: members.id });
      memberIds[name] = m.id;
    }
  }

  // ---- a demo trip with everyone on it ----
  const [trip] = await db
    .insert(trips)
    .values({ name: "Goa Trip 2026", startDate: "2026-05-01", createdAt: new Date() })
    .returning({ id: trips.id });

  const everyone = Object.values(memberIds);
  await db
    .insert(tripParticipants)
    .values(everyone.map((memberId) => ({ tripId: trip.id, memberId })));

  async function addExpense(
    description: string,
    category: string,
    amount: number,
    payer: string,
    participants: number[],
    spentOn: string
  ) {
    const [e] = await db
      .insert(expenses)
      .values({
        tripId: trip.id,
        description,
        category,
        amount,
        paidBy: memberIds[payer],
        spentOn,
        createdAt: new Date(),
      })
      .returning({ id: expenses.id });
    await db
      .insert(expenseParticipants)
      .values(participants.map((memberId) => ({ expenseId: e.id, memberId })));
  }

  await addExpense("Railway tickets (all)", "Train", 35000, "Husain", everyone, "2026-05-01");
  await addExpense("Hotel - 2 nights", "Hotel", 24000, "Karim", everyone, "2026-05-01");
  await addExpense(
    "Rickshaws day 1",
    "Rickshaw",
    1200,
    "Adil",
    [memberIds["Adil"], memberIds["Husain"], memberIds["Karim"], memberIds["Imran"]],
    "2026-05-01"
  );
  // Day-3 dinner — Sara & Bilal left after day 2, so they're excluded
  await addExpense(
    "Day 3 dinner",
    "Food",
    6000,
    "Naila",
    everyone.filter((id) => id !== memberIds["Sara"] && id !== memberIds["Bilal"]),
    "2026-05-03"
  );

  console.log("Done! Open http://localhost:3000");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
