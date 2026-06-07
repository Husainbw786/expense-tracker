import { sqliteTable, integer, text, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ---- Users (login accounts) ----
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(), // stored lowercased
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)]
);

// ---- Sessions (DB-backed, token in httpOnly cookie) ----
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(), // the random session token
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
);

// ---- Permanent roster (reused across every trip; scoped to the owning user) ----
export const families = sqliteTable("families", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  // nullable: existing rows pre-date users; backfilled by the claim script.
  ownerId: integer("owner_id").references(() => users.id, { onDelete: "cascade" }),
});

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  familyId: integer("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
});

// ---- A single trip ----
export const trips = sqliteTable("trips", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  startDate: text("start_date"), // ISO date string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  // nullable: existing rows pre-date users; backfilled by the claim script.
  // Authoritative for delete-trip / manage-invites.
  ownerId: integer("owner_id").references(() => users.id, { onDelete: "cascade" }),
});

// who can access a trip and at what role
export const tripCollaborators = sqliteTable(
  "trip_collaborators",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "owner" | "editor" | "viewer"
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    uniqueIndex("trip_collab_unique").on(t.tripId, t.userId),
    index("trip_collab_trip_idx").on(t.tripId),
    index("trip_collab_user_idx").on(t.userId),
  ]
);

// shareable invite links
export const tripInvites = sqliteTable(
  "trip_invites",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    token: text("token").notNull(),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "editor" | "viewer"
    createdById: integer("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("trip_invites_token_unique").on(t.token)]
);

// audit trail of every action on a trip
export const activityLog = sqliteTable(
  "activity_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    // keep history even if the user is deleted
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    actorName: text("actor_name"), // snapshot of who did it (survives user deletion)
    action: text("action").notNull(), // e.g. "trip.created", "expense.added"
    summary: text("summary").notNull(), // human-readable
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("activity_trip_idx").on(t.tripId)]
);

// who is on a given trip (members drawn from the roster)
export const tripParticipants = sqliteTable("trip_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tripId: integer("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tripId: integer("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  category: text("category").notNull().default("Other"),
  amount: real("amount").notNull(),
  paidBy: integer("paid_by")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  spentOn: text("spent_on"), // ISO date string (yyyy-mm-dd)
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// who shares a given expense (a subset of that trip's participants)
export const expenseParticipants = sqliteTable("expense_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  expenseId: integer("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  // How many "units" this person takes (default 1). Use 2 for double tickets, etc.
  units: integer("units").notNull().default(1),
});

export const familiesRelations = relations(families, ({ many, one }) => ({
  members: many(members),
  owner: one(users, { fields: [families.ownerId], references: [users.id] }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  family: one(families, {
    fields: [members.familyId],
    references: [families.id],
  }),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  owner: one(users, { fields: [trips.ownerId], references: [users.id] }),
  collaborators: many(tripCollaborators),
}));

export const tripCollaboratorsRelations = relations(tripCollaborators, ({ one }) => ({
  trip: one(trips, { fields: [tripCollaborators.tripId], references: [trips.id] }),
  user: one(users, { fields: [tripCollaborators.userId], references: [users.id] }),
}));

export type Role = "owner" | "editor" | "viewer";

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Family = typeof families.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type TripCollaborator = typeof tripCollaborators.$inferSelect;
export type TripInvite = typeof tripInvites.$inferSelect;
export type ActivityEntry = typeof activityLog.$inferSelect;
