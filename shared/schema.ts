import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Tracking event schema for timeline
export const trackingEventSchema = z.object({
  date: z.string(),
  time: z.string().optional(),
  location: z.string().optional(),
  status: z.string(),
  description: z.string(),
});

export type TrackingEvent = z.infer<typeof trackingEventSchema>;

// Main tracking records table
export const trackingRecords = pgTable("tracking_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNumber: text("tracking_number").notNull(),
  courier: text("courier"),
  courierCode: text("courier_code"),
  status: text("status").notNull().default("pending"),
  statusDescription: text("status_description"),
  origin: text("origin"),
  destination: text("destination"),
  estimatedDelivery: text("estimated_delivery"),
  lastUpdate: text("last_update"),
  events: jsonb("events").$type<TrackingEvent[]>().default([]),
  rawResponse: text("raw_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tracking history for recent searches
export const trackingHistory = pgTable("tracking_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNumber: text("tracking_number").notNull(),
  courier: text("courier"),
  lastStatus: text("last_status"),
  searchedAt: timestamp("searched_at").defaultNow().notNull(),
});

// Relations
export const trackingRecordsRelations = relations(trackingRecords, ({ }) => ({}));
export const trackingHistoryRelations = relations(trackingHistory, ({ }) => ({}));

// Insert schemas
export const insertTrackingRecordSchema = createInsertSchema(trackingRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrackingHistorySchema = createInsertSchema(trackingHistory).omit({
  id: true,
  searchedAt: true,
});

// Types
export type InsertTrackingRecord = z.infer<typeof insertTrackingRecordSchema>;
export type TrackingRecord = typeof trackingRecords.$inferSelect;
export type InsertTrackingHistory = z.infer<typeof insertTrackingHistorySchema>;
export type TrackingHistory = typeof trackingHistory.$inferSelect;

// API request/response schemas
export const trackRequestSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number is required"),
  carrier: z.string().optional().nullable(),
});

export type TrackRequest = z.infer<typeof trackRequestSchema>;

// Status enum for UI display
export const TrackingStatus = {
  PENDING: "pending",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  EXCEPTION: "exception",
  UNKNOWN: "unknown",
} as const;

export type TrackingStatusType = typeof TrackingStatus[keyof typeof TrackingStatus];
