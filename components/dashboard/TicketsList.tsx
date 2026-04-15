"use client";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, CheckCircle2, Send, MailOpen, Ban, Clock, Ticket as TicketIcon } from "lucide-react";

export interface TicketRow {
  id: string;
  token: string;
  short_code: string;
  buyer_email: string;
  buyer_first_name: string;
  buyer_last_name: string;
  tier_name: string;
  status: "issued" | "sent" | "checked_in" | "void";
  sent_at: string | null;
  checked_in_at: string | null;
  created_at: string;
}

function StatusDot({ status }: { status: TicketRow["status"] }) {
  const map = {
    issued:     { color: "bg-zinc-500",    label: "Émis",        ring: "ring-zinc-500/30",    Icon: Clock },
    sent:       { color: "bg-sky-500",     label: "Envoyé",      ring: "ring-sky-500/30",     Icon: Send },
    checked_in: { color: "bg-emerald-500", label: "Scanné",      ring: "ring-emerald-500/40", Icon: CheckCircle2 },
    void:       { color: "bg-red-500",     label: "Annulé",      ring: "ring-red-500/30",     Icon: Ban },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 ring-1 ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.color} shadow-[0_0_8px_currentColor]`} style={{ color: `var(--dot-${status}, transparent)` }} />
      <span className="text-[11px] font-medium text-zinc-300">{s.label}</span>
    </span>
  );
}

export function TicketsList({ tickets }: { tickets: TicketRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TicketRow["status"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter(t => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!q) return true;
      return (
        t.buyer_email.toLowerCase().includes(q) ||
        t.buyer_first_name.toLowerCase().includes(q) ||
        t.buyer_last_name.toLowerCase().includes(q) ||
        t.short_code.toLowerCase().includes(q) ||
        t.tier_name.toLowerCase().includes(q)
      );
    });
  }, [tickets, query, filter]);

  const counts = useMemo(() => ({
    all: tickets.length,
    issued: tickets.filter(t => t.status === "issued").length,
    sent: tickets.filter(t => t.status === "sent").length,
    checked_in: tickets.filter(t => t.status === "checked_in").length,
    void: tickets.filter(t => t.status === "void").length,
  }), [tickets]);

  const chips: { key: "all" | TicketRow["status"]; label: string; count: number; dot?: string }[] = [
    { key: "all",        label: "Tous",    count: counts.all },
    { key: "issued",     label: "Émis",    count: counts.issued,     dot: "bg-zinc-500" },
    { key: "sent",       label: "Envoyés", count: counts.sent,       dot: "bg-sky-500" },
    { key: "checked_in", label: "Scannés", count: counts.checked_in, dot: "bg-emerald-500" },
    { key: "void",       label: "Annulés", count: counts.void,       dot: "bg-red-500" },
  ];

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-16 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-violet-500/20 flex items-center justify-center">
          <TicketIcon className="w-5 h-5 text-violet-300" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-zinc-300">Aucun billet pour l'instant</h3>
        <p className="mt-1 text-sm text-zinc-500 max-w-xs mx-auto">
          Émettez vos premiers billets pour voir apparaître la liste ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher email, nom, code…"
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map(c => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                filter === c.key
                  ? "bg-white/10 border-white/20 text-zinc-100"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {c.dot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
              {c.label}
              <span className="tabular-nums text-zinc-500">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
          <div>Porteur</div>
          <div>Email</div>
          <div>Catégorie</div>
          <div>Statut</div>
          <div className="text-right">Dernière activité</div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">Aucun résultat</div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {filtered.map(t => {
              const lastActivity = t.checked_in_at ?? t.sent_at ?? t.created_at;
              return (
                <li key={t.id} className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="text-sm font-medium text-zinc-200">
                      {t.buyer_first_name} {t.buyer_last_name}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-600 mt-0.5">{t.short_code}</div>
                  </div>
                  <div className="text-sm text-zinc-400 truncate">{t.buyer_email}</div>
                  <div className="text-xs text-zinc-400 px-2 py-0.5 rounded-md bg-white/5">{t.tier_name}</div>
                  <StatusDot status={t.status} />
                  <div className="text-xs text-zinc-500 text-right whitespace-nowrap">
                    il y a {formatDistanceToNow(new Date(lastActivity), { locale: fr })}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
