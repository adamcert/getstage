"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { setTickets, setEvent, getScannerDB } from "@/lib/scanner/db";
import { startSync } from "@/lib/scanner/sync";
import { createBrowserClient } from "@supabase/ssr";
import type { ScannerEvent, ScannerTicket } from "@/types/scanner";
import { PartyPopper, RefreshCw, WifiOff, LogOut, User } from "lucide-react";

const ScannerView = dynamic(
  () => import("@/components/scanner/ScannerView").then((m) => ({ default: m.ScannerView })),
  { ssr: false }
);

type Status = "idle" | "loading" | "ready" | "error";

export default function ScanPage() {
  const [event, setEventState] = useState<ScannerEvent | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [offline, setOffline] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    let cleanupSync: (() => void) | undefined;

    async function bootstrap() {
      setStatus("loading");
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const res = await fetch("/api/scanner/bootstrap", { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }

        const data = await res.json() as {
          event: ScannerEvent;
          tickets: Array<ScannerTicket>;
          userEmail?: string;
        };

        await setEvent(data.event);
        await setTickets(data.tickets);

        setEventState(data.event);
        setTicketCount(data.tickets.length);
        if (data.userEmail) setUserEmail(data.userEmail);
        setStatus("ready");

        cleanupSync = startSync();
      } catch (err) {
        // Attempt offline fallback from cached IndexedDB data
        try {
          const db = getScannerDB();
          const cachedEvents = await db.events.toArray();
          if (cachedEvents.length > 0) {
            setEventState(cachedEvents[0]);
            const count = await db.tickets.where("eventId").equals(cachedEvents[0].id).count();
            setTicketCount(count);
            setStatus("ready");
            setOffline(true);
            cleanupSync = startSync();
            return;
          }
        } catch {
          // IndexedDB also failed
        }
        setErrorMsg(err instanceof Error ? err.message : "Erreur de chargement");
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
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto">
            <PartyPopper className="w-6 h-6 text-white" />
          </div>
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  if (status === "error" || !event) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-6">
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-8 text-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-red-400 font-bold text-lg">Erreur</p>
          <p className="text-zinc-500 text-sm mt-2">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5 min-h-[100dvh] flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
            <PartyPopper className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-zinc-100 truncate">{event.title}</h1>
            <p className="text-xs text-zinc-500">
              {ticketCount} billets · {new Date(event.startsAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {offline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Hors ligne</span>
            </div>
          )}
          <button
            onClick={async () => {
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
              await supabase.auth.signOut();
              window.location.href = "/scan/login";
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 hover:bg-zinc-700 transition-colors"
            title="Déconnexion"
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400 max-w-[100px] truncate">{userEmail || "..."}</span>
            <LogOut className="w-3.5 h-3.5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* QR scanner */}
      <div className="flex-1">
        <ScannerView eventId={event.id} />
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-zinc-700 pb-2">
        GetStage Scanner
      </p>
    </div>
  );
}
