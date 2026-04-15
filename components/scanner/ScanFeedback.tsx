"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

export type FeedbackResult = "ok" | "duplicate" | "invalid" | "void" | null;

interface ScanFeedbackProps {
  result: FeedbackResult;
  name?: string;
}

const CONFIG: Record<
  NonNullable<FeedbackResult>,
  { label: string; sub: string; bg: string; icon: React.ReactNode }
> = {
  ok: {
    label: "Admitted",
    sub: "Ticket is valid",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: <CheckCircle className="w-12 h-12 text-emerald-400" />,
  },
  duplicate: {
    label: "Already scanned",
    sub: "This ticket was already used",
    bg: "bg-orange-500/10 border-orange-500/30",
    icon: <AlertCircle className="w-12 h-12 text-orange-400" />,
  },
  invalid: {
    label: "Invalid ticket",
    sub: "QR code not found",
    bg: "bg-red-500/10 border-red-500/30",
    icon: <XCircle className="w-12 h-12 text-red-400" />,
  },
  void: {
    label: "Void ticket",
    sub: "This ticket has been voided",
    bg: "bg-red-500/10 border-red-500/30",
    icon: <XCircle className="w-12 h-12 text-red-400" />,
  },
};

export function ScanFeedback({ result, name }: ScanFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (result) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [result]);

  if (!result || !visible) return null;

  const cfg = CONFIG[result];

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all ${cfg.bg}`}
    >
      {cfg.icon}
      <div className="text-center">
        <p className="text-xl font-bold text-zinc-100">{cfg.label}</p>
        {name && <p className="text-lg text-zinc-300 mt-0.5">{name}</p>}
        <p className="text-sm text-zinc-500 mt-1">{cfg.sub}</p>
      </div>
    </div>
  );
}
