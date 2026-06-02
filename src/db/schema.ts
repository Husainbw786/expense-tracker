import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ---- Permanent roster (reused across every trip) ----
export const families = sqliteTable("families", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
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
});

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
});

export const familiesRelations = relations(families, ({ many }) => ({
  members: many(members),
}));

export const membersRelations = relations(members, ({ one }) => ({
  family: one(families, {
    fields: [members.familyId],
    references: [families.id],
  }),
}));

export type Family = typeof families.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
