"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getScannerDB } from "@/lib/scanner/db";

interface LiveCounterProps {
  eventId: string;
  capacity: number;
}

export function LiveCounter({ eventId, capacity }: LiveCounterProps) {
  const checkedIn = useLiveQuery(
    () =>
      getScannerDB()
        .tickets.where("eventId")
        .equals(eventId)
        .filter((t) => t.status === "checked_in")
        .count(),
    [eventId],
    0
  );

  const count = checkedIn ?? 0;
  const pct = capacity > 0 ? Math.min(100, (count / capacity) * 100) : 0;

  // Color rules: <70% green, 70-90% orange, >90% red
  const barColor =
    pct >= 90
      ? "from-red-500 to-red-400"
      : pct >= 70
      ? "from-orange-500 to-amber-400"
      : "from-emerald-500 to-green-400";

  const textColor =
    pct >= 90
      ? "text-red-400"
      : pct >= 70
      ? "text-orange-400"
      : "text-emerald-400";

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className={`text-7xl font-black tabular-nums ${textColor}`}>
        {count}
      </div>
      <div className="text-zinc-400 text-lg font-medium">
        / {capacity} capacity
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-3 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="text-zinc-500 text-sm">{pct.toFixed(1)}% capacity</div>
    </div>
  );
}
