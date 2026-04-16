"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XOctagon, AlertTriangle, Ban } from "lucide-react";

export type FeedbackResult = "ok" | "duplicate" | "invalid" | "void" | null;

interface ScanFeedbackProps {
  result: FeedbackResult;
  name?: string;
  tierName?: string;
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

export function ScanFeedback({ result, name, tierName }: ScanFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (result) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [result]);

  if (!result || !visible) return null;

  const cfg = CONFIG[result];
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl border-2 ${cfg.border} ${cfg.bg} backdrop-blur-xl p-8 flex flex-col items-center gap-4 shadow-2xl`}
      >
        <Icon className={`w-16 h-16 ${cfg.iconColor}`} />
        <div className="text-center">
          <p className="text-2xl font-black tracking-wide text-white">{cfg.label}</p>
          {name && (
            <p className="text-lg font-semibold text-zinc-200 mt-1">{name}</p>
          )}
          {tierName && result === "ok" && (
            <p className="text-sm font-medium text-zinc-400 mt-0.5">{tierName}</p>
          )}
          <p className="text-sm text-zinc-500 mt-2">{cfg.sub}</p>
        </div>
      </div>
    </div>
  );
}
