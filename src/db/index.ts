import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Local dev uses a file (no account needed). Production uses a Turso/libSQL URL.
const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema };
