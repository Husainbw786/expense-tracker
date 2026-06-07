import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLog } from "@/db/schema";

export async function logActivity(opts: {
  tripId: number;
  userId: number | null;
  actorName: string | null;
  action: string;
  summary: string;
}): Promise<void> {
  await db.insert(activityLog).values({
    tripId: opts.tripId,
    userId: opts.userId,
    actorName: opts.actorName,
    action: opts.action,
    summary: opts.summary,
    createdAt: new Date(),
  });
}

export async function getTripActivity(tripId: number) {
  return db
    .select()
    .from(activityLog)
    .where(eq(activityLog.tripId, tripId))
    .orderBy(desc(activityLog.createdAt), desc(activityLog.id));
}
