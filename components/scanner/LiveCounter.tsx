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

  const barColor =
    pct >= 90
      ? "bg-red-500"
      : pct >= 70
      ? "bg-amber-500"
      : "bg-emerald-500";

  const textColor =
    pct >= 90
      ? "text-red-400"
      : pct >= 70
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <div className="flex items-center gap-4">
      {/* Big number */}
      <div className={`text-4xl font-black tabular-nums ${textColor}`}>
        {count}
      </div>
      {/* Progress + label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Entrées</span>
          <span className="text-xs text-zinc-600 tabular-nums">{count}/{capacity}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
