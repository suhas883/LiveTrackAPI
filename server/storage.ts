import { 
  trackingRecords, 
  trackingHistory,
  type TrackingRecord, 
  type InsertTrackingRecord,
  type TrackingHistory as TrackingHistoryType,
  type InsertTrackingHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Tracking Records
  createTrackingRecord(record: InsertTrackingRecord): Promise<TrackingRecord>;
  getTrackingRecord(id: string): Promise<TrackingRecord | undefined>;
  getTrackingByNumber(trackingNumber: string): Promise<TrackingRecord | undefined>;
  updateTrackingRecord(id: string, record: Partial<InsertTrackingRecord>): Promise<TrackingRecord | undefined>;

  // Tracking History
  createTrackingHistory(history: InsertTrackingHistory): Promise<TrackingHistoryType>;
  getTrackingHistory(limit?: number): Promise<TrackingHistoryType[]>;
  deleteTrackingHistory(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Tracking Records
  async createTrackingRecord(record: InsertTrackingRecord): Promise<TrackingRecord> {
    const [created] = await db
      .insert(trackingRecords)
      .values({
        ...record,
        // Relax typing for events to avoid TS2769 complaints during inserts
        events: (record as any).events as any,
      })
      .returning();
    return created;
  }

  async getTrackingRecord(id: string): Promise<TrackingRecord | undefined> {
    const [record] = await db
      .select()
      .from(trackingRecords)
      .where(eq(trackingRecords.id, id));
    return record || undefined;
  }

  async getTrackingByNumber(trackingNumber: string): Promise<TrackingRecord | undefined> {
    const [record] = await db
      .select()
      .from(trackingRecords)
      .where(eq(trackingRecords.trackingNumber, trackingNumber))
      .orderBy(desc(trackingRecords.updatedAt))
      .limit(1);
    return record || undefined;
  }

  async updateTrackingRecord(id: string, record: Partial<InsertTrackingRecord>): Promise<TrackingRecord | undefined> {
    const [updated] = await db
      .update(trackingRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(trackingRecords.id, id))
      .returning();
    return updated || undefined;
  }

  // Tracking History
  async createTrackingHistory(history: InsertTrackingHistory): Promise<TrackingHistoryType> {
    const [created] = await db
      .insert(trackingHistory)
      .values(history)
      .returning();
    return created;
  }

  async getTrackingHistory(limit: number = 20): Promise<TrackingHistoryType[]> {
    return db
      .select()
      .from(trackingHistory)
      .orderBy(desc(trackingHistory.searchedAt))
      .limit(limit);
  }

  async deleteTrackingHistory(id: string): Promise<boolean> {
    const result = await db
      .delete(trackingHistory)
      .where(eq(trackingHistory.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
