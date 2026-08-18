import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const dispatchEvents = pgTable("dispatch_events", {
  id: serial().primaryKey(),
  eventType: text("event_type").notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  issueType: text("issue_type"),
  message: text(),
  priority: boolean().notNull().default(false),
  status: text().notNull().default("received"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

