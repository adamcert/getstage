"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export interface ScanEntry {
  result: string;
  scanned_at: string;
  token_hint: string | null;
  ticket_id: string | null;
}

function ResultIcon({ result }: { result: string }) {
  if (result === "ok") return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
  if (result === "duplicate") return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
  return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
}

function resultLabel(result: string): string {
  if (result === "ok") return "Validé";
  if (result === "duplicate") return "Doublon";
  if (result === "invalid") return "Invalide";
  if (result === "void") return "Annulé";
  return result;
}

export function RecentScans({ data }: { data: ScanEntry[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Scans récents</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
          Aucun scan enregistré
        </div>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {data.map((s, i) => (
            <li
              key={i}
              className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
            >
              <ResultIcon result={s.result} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {resultLabel(s.result)}
                  {s.token_hint && (
                    <span className="ml-1 text-xs text-gray-400 font-mono">{s.token_hint}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {formatDistanceToNow(new Date(s.scanned_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
