import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const queryStatusEnum = pgEnum("query_status", ["pending", "in_review", "resolved", "closed"]);
export const queryCategoryEnum = pgEnum("query_category", [
  "family_law",
  "criminal_law",
  "corporate_law",
  "property_law",
  "employment_law",
  "immigration_law",
  "other",
]);

export const legalQueriesTable = pgTable("legal_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: queryCategoryEnum("category").notNull(),
  status: queryStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLegalQuerySchema = createInsertSchema(legalQueriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLegalQuery = z.infer<typeof insertLegalQuerySchema>;
export type LegalQuery = typeof legalQueriesTable.$inferSelect;
