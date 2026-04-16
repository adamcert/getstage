"use client";

import Dexie, { type Table } from "dexie";
import type { ScannerTicket, QueueItem, ScannerEvent } from "@/types/scanner";

class ScannerDB extends Dexie {
  tickets!: Table<ScannerTicket, string>;
  queue!: Table<QueueItem, number>;
  events!: Table<ScannerEvent, string>;

  constructor() {
    super("scanner_db");
    this.version(1).stores({
      tickets: "token, status, eventId",
      queue: "++id, token, retries",
      events: "id",
    });
  }
}

// Singleton — only created once on the client
let _db: ScannerDB | null = null;

function getDB(): ScannerDB {
  if (!_db) {
    _db = new ScannerDB();
  }
  return _db;
}

export function getScannerDB(): ScannerDB {
  return getDB();
}

/** Replace all tickets for an event (called after bootstrap) */
export async function setTickets(tickets: ScannerTicket[]): Promise<void> {
  const db = getDB();
  await db.transaction("rw", db.tickets, async () => {
    if (tickets.length > 0) {
      const eventId = tickets[0].eventId;
      await db.tickets.where("eventId").equals(eventId).delete();
    }
    await db.tickets.bulkPut(tickets);
  });
}

/** Upsert the event metadata */
export async function setEvent(event: ScannerEvent): Promise<void> {
  const db = getDB();
  await db.events.put(event);
}

/** Retrieve the event metadata (returns undefined when not yet bootstrapped) */
export async function getEvent(eventId: string): Promise<ScannerEvent | undefined> {
  const db = getDB();
  return db.events.get(eventId);
}

/** Get or generate a stable device identifier persisted in localStorage */
export function getDeviceId(): string {
  const KEY = "gs_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
