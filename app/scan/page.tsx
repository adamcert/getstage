"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { setTickets, setEvent } from "@/lib/scanner/db";
import { startSync } from "@/lib/scanner/sync";
import type { ScannerEvent } from "@/types/scanner";

// Lazy-load the heavy scanner components (webcam + Dexie live queries)
const LiveCounter = dynamic(
  () => import("@/components/scanner/LiveCounter").then((m) => ({ default: m.LiveCounter })),
  { ssr: false }
);

const ScannerView = dynamic(
  () => import("@/components/scanner/ScannerView").then((m) => ({ default: m.ScannerView })),
  { ssr: false }
);

type Status = "idle" | "loading" | "ready" | "error";

export default function ScanPage() {
  const [event, setEventState] = useState<ScannerEvent | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cleanupSync: (() => void) | undefined;

    async function bootstrap() {
      setStatus("loading");
      try {
        const res = await fetch("/api/scanner/bootstrap");
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }

        const data = await res.json() as {
          event: ScannerEvent;
          tickets: Array<{
            token: string;
            status: string;
            firstName: string;
            lastName: string;
            tierName: string;
            eventId: string;
          }>;
        };

        await setEvent(data.event);
        await setTickets(data.tickets);

        setEventState(data.event);
        setStatus("ready");

        // Start background sync queue
        cleanupSync = startSync();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Bootstrap failed");
        setStatus("error");
      }
    }

    bootstrap();

    return () => {
      cleanupSync?.();
    };
  }, []);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Loading event data…</p>
        </div>
      </div>
    );
  }

  if (status === "error" || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-6 py-5 text-center max-w-sm">
          <p className="text-red-400 font-semibold">Bootstrap error</p>
          <p className="text-zinc-400 text-sm mt-1">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-sm hover:bg-zinc-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Event header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-zinc-100">{event.title}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {new Date(event.startsAt).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Live admission counter */}
      <LiveCounter eventId={event.id} capacity={event.capacity} />

      {/* QR scanner */}
      <ScannerView eventId={event.id} />
    </div>
  );
}
