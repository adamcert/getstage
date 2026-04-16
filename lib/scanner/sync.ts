"use client";

import { getScannerDB, getDeviceId } from "./db";
import type { QueueItem } from "@/types/scanner";

const MAX_SERVER_RETRIES = 10; // only counts server 5xx errors, not network failures
const FLUSH_INTERVAL_MS = 10_000; // 10 s
let _flushing = false;

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
  if (!navigator.onLine || _flushing) return;
  _flushing = true;

  try {
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

          // Update local ticket status for 'ok' or 'duplicate' results
          const data = await res.json() as { result: string };
          if (data.result === "ok" || data.result === "duplicate") {
            await db.tickets.where("token").equals(item.token).modify({ status: "checked_in" });
          }
        } else if (res.status === 401 || res.status === 403) {
          // Auth expired — DON'T delete, keep in queue for after re-login
          // Stop flushing this cycle — all subsequent items will also fail
          console.warn("[sync] auth expired, pausing flush");
          break;
        } else {
          // Server error (5xx) — count toward retry limit
          if (item.id !== undefined) {
            const newRetries = item.retries + 1;
            if (newRetries >= MAX_SERVER_RETRIES) {
              console.warn(`[sync] dropping queue item after ${MAX_SERVER_RETRIES} server errors:`, item.token);
              await db.queue.delete(item.id);
            } else {
              await db.queue.update(item.id, { retries: newRetries });
            }
          }
        }
      } catch {
        // Network error — do NOT increment retries, just skip for now
        // Item stays in queue and will be retried next flush
      }
    }
  } finally {
    _flushing = false;
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
