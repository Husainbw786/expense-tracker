/**
 * One-time import of the Ahmedabad Tour data into the database.
 *
 * Run:  npm run import
 *   - With no .env  -> loads into the local file (local.db) for previewing.
 *   - With DATABASE_URL + DATABASE_AUTH_TOKEN in .env -> loads into the cloud DB.
 *
 * NOTE: this WIPES existing data and replaces it. Use on a fresh DB.
 *
 * Model: the 3 shared bills are paid from a neutral "Trip Kitty", and every person
 * owes their share into it. This reproduces the family-wise collection list exactly.
 * To switch to "one real person paid everything", change PAID_BY below to that name.
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

const TRIP_NAME = "Ahmedabad Tour";
const KITTY_FAMILY = "🏦 Trip Kitty (paid the bills)";
const KITTY_MEMBER = "Trip Kitty";

// The 7 families and everyone in them (32 people).
const FAMILIES: { name: string; people: string[] }[] = [
  { name: "Husain B Family", people: ["Husain B", "Zainab", "Nafisa", "Burhan", "Femida"] },
  { name: "Mohnawala Family", people: ["Haider", "Munira", "Ruquaiya", "Husain M", "Tasneem"] },
  { name: "Rassiwala Family", people: ["Mana", "Mariya", "Qusai"] },
  { name: "Kasubhaiwala Family", people: ["Murtaza K", "Fatema K", "Zainab K", "Sakina S", "Shabbir S"] },
  {
    name: "Barodwala Family",
    people: ["Shabbir H", "Husaina B", "Burhan I", "Arwa", "Zahra", "Tahera", "Huzaifa", "Hussaina", "Zainab B"],
  },
  { name: "Khuzem Mama Family", people: ["Murtaza M", "Khuzaima", "Raziya M"] },
  { name: "Zainab Mami Family", people: ["Zainab S", "Husain S"] },
];

// People who were NOT part of Travel & Hoob (only the hotel).
const HOTEL_ONLY = ["Huzaifa", "Murtaza K"];

async function main() {
  console.log(`Importing "${TRIP_NAME}"...`);

  // fresh start
  await db.delete(expenseParticipants);
  await db.delete(expenses);
  await db.delete(tripParticipants);
  await db.delete(trips);
  await db.delete(members);
  await db.delete(families);

  // ---- roster (real families/people) ----
  const idByName: Record<string, number> = {};
  const allRealIds: number[] = [];
  for (const f of FAMILIES) {
    const [fam] = await db
      .insert(families)
      .values({ name: f.name })
      .returning({ id: families.id });
    for (const name of f.people) {
      const [m] = await db
        .insert(members)
        .values({ name, familyId: fam.id })
        .returning({ id: members.id });
      idByName[name] = m.id;
      allRealIds.push(m.id);
    }
  }

  // ---- the kitty that "paid" the bills (its own family, owes nothing) ----
  const [kittyFam] = await db
    .insert(families)
    .values({ name: KITTY_FAMILY })
    .returning({ id: families.id });
  const [kitty] = await db
    .insert(members)
    .values({ name: KITTY_MEMBER, familyId: kittyFam.id })
    .returning({ id: members.id });

  // ---- the trip; everyone (incl. kitty) is on it ----
  const [trip] = await db
    .insert(trips)
    .values({ name: TRIP_NAME, startDate: null, createdAt: new Date() })
    .returning({ id: trips.id });
  await db
    .insert(tripParticipants)
    .values([...allRealIds, kitty.id].map((memberId) => ({ tripId: trip.id, memberId })));

  // participants of Travel & Hoob = everyone except the hotel-only people
  const hotelOnlyIds = new Set(HOTEL_ONLY.map((n) => idByName[n]));
  const travelAndHoobIds = allRealIds.filter((id) => !hotelOnlyIds.has(id));

  async function addExpense(
    description: string,
    category: string,
    amount: number,
    participantIds: number[]
  ) {
    const [e] = await db
      .insert(expenses)
      .values({
        tripId: trip.id,
        description,
        category,
        amount,
        paidBy: kitty.id,
        spentOn: null,
        createdAt: new Date(),
      })
      .returning({ id: expenses.id });
    await db
      .insert(expenseParticipants)
      .values(participantIds.map((memberId) => ({ expenseId: e.id, memberId })));
  }

  await addExpense("Hotel", "Hotel", 27000, allRealIds); // all 32
  await addExpense("Travel (bus)", "Travel", 13000, travelAndHoobIds); // 30
  await addExpense("Hoob Hasanfeer (3 thaal)", "Food", 3000, travelAndHoobIds); // 30

  console.log(
    `Done! ${FAMILIES.length} families, ${allRealIds.length} people, 3 shared expenses. ` +
      `Total = ${27000 + 13000 + 3000}.`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
