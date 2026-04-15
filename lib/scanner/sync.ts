"use client";

import { getScannerDB, getDeviceId } from "./db";
import type { QueueItem } from "@/types/scanner";

const MAX_RETRIES = 5;
const FLUSH_INTERVAL_MS = 10_000; // 10 s

/** Add a scanned token to the offline sync queue */
export async function enqueue(token: string): Promise<void> {
  const db = getScannerDB();
  const item: QueueItem = {
    token,
    scannedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    retries: 0,
  };
  await db.queue.add(item);
}

/** Attempt to POST all queued items to the server */
export async function flush(): Promise<void> {
  if (!navigator.onLine) return;

  const db = getScannerDB();
  const items = await db.queue.toArray();
  if (items.length === 0) return;

  for (const item of items) {
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: item.token,
          device_id: item.deviceId,
          scanned_at: item.scannedAt,
        }),
      });

      if (res.ok) {
        // Success — remove from queue
        if (item.id !== undefined) {
          await db.queue.delete(item.id);
        }

        // Update local ticket status for 'ok' result
        const data = await res.json() as { result: string };
        if (data.result === "ok") {
          await db.tickets.where("token").equals(item.token).modify({ status: "checked_in" });
        }
      } else if (res.status === 401 || res.status === 403) {
        // Auth failures — no point retrying
        if (item.id !== undefined) {
          await db.queue.delete(item.id);
        }
      } else {
        // Transient error — increment retry counter
        if (item.id !== undefined) {
          const newRetries = item.retries + 1;
          if (newRetries >= MAX_RETRIES) {
            await db.queue.delete(item.id);
          } else {
            await db.queue.update(item.id, { retries: newRetries });
          }
        }
      }
    } catch {
      // Network error — increment retry counter
      if (item.id !== undefined) {
        const newRetries = item.retries + 1;
        if (newRetries >= MAX_RETRIES) {
          await db.queue.delete(item.id);
        } else {
          await db.queue.update(item.id, { retries: newRetries });
        }
      }
    }
  }
}

/** Start the background sync — call once on mount */
let _started = false;

export function startSync(): () => void {
  if (_started || typeof window === "undefined") return () => {};
  _started = true;

  // Flush when we come back online
  const handleOnline = () => flush();
  window.addEventListener("online", handleOnline);

  // Also flush on a 10 s interval
  const intervalId = setInterval(() => flush(), FLUSH_INTERVAL_MS);

  // Flush immediately in case there are queued items from a previous session
  flush();

  // Return cleanup
  return () => {
    _started = false;
    window.removeEventListener("online", handleOnline);
    clearInterval(intervalId);
  };
}
