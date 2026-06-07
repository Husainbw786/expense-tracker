/**
 * Dump all current data to a timestamped JSON file (safety backup before migrations).
 * Reads whatever DATABASE_URL points to (.env = production).
 * Uses raw SELECT * so it works regardless of the current schema version.
 *   npm run backup
 */
import "dotenv/config";
import { writeFileSync, mkdirSync } from "fs";
import { sql } from "drizzle-orm";
import { db } from "./index";

async function dumpTable(name: string) {
  try {
    const r = await db.run(sql.raw(`SELECT * FROM ${name}`));
    return (r as unknown as { rows: unknown[] }).rows;
  } catch {
    return [];
  }
}

async function main() {
  const when = new Date().toISOString();
  const dump: Record<string, unknown> = {
    when,
    dbUrl: (process.env.DATABASE_URL ?? "").replace(/\/\/.*@/, "//***@"),
  };
  for (const t of ["families", "members", "trips", "trip_participants", "expenses", "expense_participants"]) {
    dump[t] = await dumpTable(t);
  }
  mkdirSync("backups", { recursive: true });
  const file = `backups/backup-${when.replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(dump, null, 2));
  const counts = ["trips", "families", "members", "expenses"]
    .map((t) => `${(dump[t] as unknown[]).length} ${t}`)
    .join(", ");
  console.log(`Backed up to ${file}`);
  console.log(`  ${counts}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
