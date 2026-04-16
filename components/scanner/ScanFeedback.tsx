"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XOctagon, AlertTriangle, Ban } from "lucide-react";

export type FeedbackResult = "ok" | "duplicate" | "invalid" | "void" | null;

interface ScanFeedbackProps {
  result: FeedbackResult;
  name?: string;
}

const CONFIG: Record<
  NonNullable<FeedbackResult>,
  {
    label: string;
    sub: string;
    bg: string;
    border: string;
    iconColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  ok: {
    label: "BIENVENUE",
    sub: "Billet valide — bonne soirée !",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    iconColor: "text-emerald-400",
    icon: CheckCircle,
  },
  duplicate: {
    label: "DÉJÀ SCANNÉ",
    sub: "Ce billet a déjà été utilisé",
    bg: "bg-amber-500/20",
    border: "border-amber-500/40",
    iconColor: "text-amber-400",
    icon: AlertTriangle,
  },
  invalid: {
    label: "INVALIDE",
    sub: "QR code non reconnu",
    bg: "bg-red-500/20",
    border: "border-red-500/40",
    iconColor: "text-red-400",
    icon: XOctagon,
  },
  void: {
    label: "ANNULÉ",
    sub: "Ce billet a été annulé",
    bg: "bg-red-500/20",
    border: "border-red-500/40",
    iconColor: "text-red-400",
    icon: Ban,
  },
};

export function ScanFeedback({ result, name }: ScanFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (result) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(t);
    }
  }, [result]);

  if (!result || !visible) return null;

  const cfg = CONFIG[result];
  const Icon = cfg.icon;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-2xl border ${cfg.border} ${cfg.bg} backdrop-blur-xl px-5 py-4 flex items-center gap-4 shadow-2xl`}
      >
        <Icon className={`w-10 h-10 ${cfg.iconColor} flex-shrink-0`} />
        <div className="min-w-0">
          <p className="text-lg font-black tracking-wide text-white">{cfg.label}</p>
          {name && (
            <p className="text-sm font-semibold text-zinc-200 truncate">{name}</p>
          )}
          <p className="text-xs text-zinc-500">{cfg.sub}</p>
        </div>
      </div>
    </div>
  );
}
