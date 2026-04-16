"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getScannerDB } from "@/lib/scanner/db";
import { enqueue } from "@/lib/scanner/sync";
import { ScanFeedback, type FeedbackResult } from "./ScanFeedback";
import { Camera } from "lucide-react";

/** Extract raw token from a scanned value (may be a full URL like https://app/t/TOKEN) */
function extractToken(scanned: string): string {
  try {
    const url = new URL(scanned);
    const parts = url.pathname.split("/");
    const tIdx = parts.indexOf("t");
    if (tIdx !== -1 && parts[tIdx + 1]) return parts[tIdx + 1];
  } catch {
    // not a URL — use as-is
  }
  return scanned;
}

interface ScannerViewProps {
  eventId: string;
}

export function ScannerView({ eventId }: ScannerViewProps) {
  const scannerRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<FeedbackResult>(null);
  const [feedbackName, setFeedbackName] = useState<string | undefined>();
  const [feedbackTier, setFeedbackTier] = useState<string | undefined>();
  const [scanCount, setScanCount] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalScans, setTotalScans] = useState(0);
  // Deduplicate rapid scans of the same token
  const lastToken = useRef<string | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScan = useCallback(
    async (rawScanned: string) => {
      const token = extractToken(rawScanned);

      // Ignore if same token scanned within cooldown window
      if (lastToken.current === token) return;
      lastToken.current = token;
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => {
        lastToken.current = null;
      }, 3000);

      // Look up token in local IndexedDB
      const db = getScannerDB();
      const ticket = await db.tickets.get(token);

      let result: FeedbackResult;
      let name: string | undefined;
      let tier: string | undefined;

      if (!ticket) {
        result = "invalid";
      } else if (ticket.status === "void" || ticket.status === "cancelled") {
        result = "void";
        name = `${ticket.firstName} ${ticket.lastName}`;
        tier = ticket.tierName;
      } else if (ticket.status === "checked_in") {
        result = "duplicate";
        name = `${ticket.firstName} ${ticket.lastName}`;
        tier = ticket.tierName;
      } else if (ticket.status === "issued" || ticket.status === "sent") {
        result = "ok";
        name = `${ticket.firstName} ${ticket.lastName}`;
        tier = ticket.tierName;
        // Optimistically mark as checked_in in local DB
        await db.tickets.where("token").equals(token).modify({ status: "checked_in" });
      } else {
        result = "invalid";
      }

      setFeedback(result);
      setFeedbackName(name);
      setFeedbackTier(tier);
      setScanCount((c) => c + 1);
      setTotalScans((c) => c + 1);

      // Vibrate feedback
      try {
        if (result === "ok") {
          navigator.vibrate?.(150);
        } else if (result === "duplicate") {
          navigator.vibrate?.([100, 80, 100, 80, 100]);
        } else {
          navigator.vibrate?.([200, 100, 200]);
        }
      } catch {
        // vibrate not available
      }

      // Only enqueue ok/duplicate for server sync
      if (result === "ok" || result === "duplicate") {
        await enqueue(token);
      }
    },
    [eventId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let stopped = false;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (stopped || !containerRef.current) return;

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1,
          },
          (decodedText) => {
            handleScan(decodedText).catch(console.error);
          },
          () => {
            // QR scanning errors are benign (no QR found in frame)
          }
        );

        setScanning(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible d'accéder à la caméra");
      }
    }

    startScanner();

    return () => {
      stopped = true;
      if (scannerRef.current) {
        const s = scannerRef.current as { stop: () => Promise<void> };
        s.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [handleScan]);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-center">
          <p className="text-sm text-red-400 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Camera viewfinder */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800 aspect-square">
        <div ref={containerRef} id="qr-reader" className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full [&>img]:hidden [&_#qr-shaded-region]:!border-[3px] [&_#qr-shaded-region]:!border-violet-500/60" />

        {/* Corner markers */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[280px] h-[280px] relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-violet-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-violet-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-violet-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-violet-400 rounded-br-lg" />
          </div>
        </div>

        {!scanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/80">
            <Camera className="w-10 h-10 text-zinc-500 animate-pulse" />
            <p className="text-zinc-500 text-sm font-medium">Démarrage caméra…</p>
          </div>
        )}
      </div>

      {/* Scan count */}
      {totalScans > 0 && (
        <p className="text-center text-xs text-zinc-600">
          {totalScans} scan{totalScans > 1 ? "s" : ""} cette session
        </p>
      )}

      {/* Feedback overlay */}
      <ScanFeedback key={scanCount} result={feedback} name={feedbackName} tierName={feedbackTier} />
    </div>
  );
}
