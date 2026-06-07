/**
 * One-time backfill: assign all ownerless trips & families to an existing user.
 *
 * The owner must SIGN UP first (via the app), then run:
 *   CLAIM_EMAIL=husain@whozzat.com npm run claim
 *
 * Idempotent — safe to re-run.
 */
import "dotenv/config";
import { isNull, eq, and } from "drizzle-orm";
import { db } from "./index";
import { users, trips, families, tripCollaborators, activityLog } from "./schema";

async function main() {
  const email = (process.env.CLAIM_EMAIL ?? "").trim().toLowerCase();
  if (!email) {
    console.error("Set CLAIM_EMAIL=you@example.com");
    process.exit(1);
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    console.error(`No user with email "${email}". Sign up in the app first, then re-run.`);
    process.exit(1);
  }
  console.log(`Claiming ownerless data for ${user.name} <${email}> (id ${user.id})...`);

  // Families
  const famRes = await db
    .update(families)
    .set({ ownerId: user.id })
    .where(isNull(families.ownerId))
    .returning({ id: families.id });
  console.log(`  families claimed: ${famRes.length}`);

  // Trips
  const tripRes = await db
    .update(trips)
    .set({ ownerId: user.id })
    .where(isNull(trips.ownerId))
    .returning({ id: trips.id, name: trips.name });
  console.log(`  trips claimed: ${tripRes.length}`);

  // Owner collaborator rows + activity backfill (idempotent)
  for (const t of tripRes) {
    const existing = await db
      .select({ id: tripCollaborators.id })
      .from(tripCollaborators)
      .where(and(eq(tripCollaborators.tripId, t.id), eq(tripCollaborators.userId, user.id)))
      .limit(1);
    if (!existing[0]) {
      await db.insert(tripCollaborators).values({
        tripId: t.id,
        userId: user.id,
        role: "owner",
        createdAt: new Date(),
      });
      await db.insert(activityLog).values({
        tripId: t.id,
        userId: user.id,
        actorName: user.name,
        action: "trip.imported",
        summary: `imported "${t.name}" into their account`,
        createdAt: new Date(),
      });
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
