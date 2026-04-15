"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getScannerDB } from "@/lib/scanner/db";
import { enqueue } from "@/lib/scanner/sync";
import { ScanFeedback, type FeedbackResult } from "./ScanFeedback";

interface ScannerViewProps {
  eventId: string;
}

export function ScannerView({ eventId }: ScannerViewProps) {
  const scannerRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<FeedbackResult>(null);
  const [feedbackName, setFeedbackName] = useState<string | undefined>();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Deduplicate rapid scans of the same token
  const lastToken = useRef<string | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScan = useCallback(
    async (token: string) => {
      // Ignore if same token scanned within cooldown window
      if (lastToken.current === token) return;
      lastToken.current = token;
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => {
        lastToken.current = null;
      }, 2000);

      // Look up token in local IndexedDB
      const db = getScannerDB();
      const ticket = await db.tickets.get(token);

      let result: FeedbackResult;
      let name: string | undefined;

      if (!ticket) {
        result = "invalid";
      } else if (ticket.status === "void") {
        result = "void";
        name = `${ticket.firstName} ${ticket.lastName}`;
      } else if (ticket.status === "checked_in") {
        result = "duplicate";
        name = `${ticket.firstName} ${ticket.lastName}`;
      } else {
        result = "ok";
        name = `${ticket.firstName} ${ticket.lastName}`;
        // Optimistically mark as checked_in in local DB
        await db.tickets.where("token").equals(token).modify({ status: "checked_in" });
      }

      setFeedback(result);
      setFeedbackName(name);

      // Vibrate feedback: 1 short = ok, 2 short = duplicate/invalid
      try {
        if (result === "ok") {
          navigator.vibrate?.(100);
        } else {
          navigator.vibrate?.([100, 80, 100]);
        }
      } catch {
        // vibrate not available
      }

      // Add to sync queue for all valid results (server will deduplicate duplicates)
      await enqueue(token);
    },
    [eventId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let stopped = false;

    async function startScanner() {
      try {
        // Dynamic import — html5-qrcode is browser-only
        const { Html5QrcodeScanner, Html5QrcodeScanType } = await import("html5-qrcode");

        if (stopped || !containerRef.current) return;

        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            rememberLastUsedCamera: true,
          },
          /* verbose= */ false
        );

        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            handleScan(decodedText).catch(console.error);
          },
          (errorMsg) => {
            // QR scanning errors are benign (no QR found in frame) — ignore
            void errorMsg;
          }
        );

        setScanning(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start camera");
      }
    }

    startScanner();

    return () => {
      stopped = true;
      if (scannerRef.current) {
        const s = scannerRef.current as { clear: () => Promise<void> };
        s.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [handleScan]);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* html5-qrcode mounts into this div */}
      <div
        ref={containerRef}
        id="qr-reader"
        className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800"
      />

      {!scanning && !error && (
        <p className="text-center text-zinc-500 text-sm animate-pulse">
          Starting camera…
        </p>
      )}

      <ScanFeedback result={feedback} name={feedbackName} />
    </div>
  );
}
