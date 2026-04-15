"use client";
import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { TicketsImport } from "./TicketsImport";

interface Tier { id: string; name: string; price_cents: number; }

export function TicketsPageHeader({ eventId, tiers }: { eventId: string; tiers: Tier[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-violet-500 flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100">Émettre de nouveaux billets</div>
            <div className="text-xs text-zinc-500">Importer une liste d'acheteurs et générer leurs billets</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-zinc-800">
          <TicketsImport eventId={eventId} tiers={tiers} />
        </div>
      )}
    </div>
  );
}
