"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { Eye, Send, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface Tier { id: string; name: string; price_cents: number; }

interface ParsedRow {
  email: string;
  firstName: string;
  lastName: string;
  tier: string;
  qty: number;
}

interface Props { eventId: string; tiers: Tier[]; }

const PLACEHOLDER = `email,firstName,lastName
alice@example.com,Alice,Dupont
bob@example.com,Bob,Martin`;

export function TicketsImport({ eventId, tiers }: Props) {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [issueResult, setIssueResult] = useState<{ issued: number; errors: string[] } | null>(null);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState<"issue" | "send" | null>(null);

  const defaultTier = tiers.length > 0 ? tiers[0].name : "Standard";

  const handlePreview = useCallback(() => {
    setParseError(null);
    setPreview([]);
    setIssueResult(null);
    setSendResult(null);

    if (!csv.trim()) {
      setParseError("Le champ est vide.");
      return;
    }

    const trimmed = csv.trim();
    const lines = trimmed.split("\n").map(l => l.trim()).filter(Boolean);

    // Detect mode: simple email list (no comma/tab in first line, looks like emails)
    const firstLine = lines[0];
    const isSimpleEmailList = !firstLine.includes(",") && !firstLine.includes("\t") && firstLine.includes("@");

    let rows: ParsedRow[];

    if (isSimpleEmailList) {
      // Simple mode: each line is just an email
      rows = lines
        .filter(l => l.includes("@"))
        .map(email => ({
          email,
          firstName: "",
          lastName: "",
          tier: defaultTier,
          qty: 1,
        }));
    } else {
      // CSV mode
      const looksTab = trimmed.includes("\t");
      const result = Papa.parse<Record<string, string>>(trimmed, {
        header: true,
        delimiter: looksTab ? "\t" : ",",
        skipEmptyLines: true,
        transformHeader: h => h.trim(),
      });

      if (result.errors.length > 0) {
        setParseError(result.errors.map(e => e.message).join(", "));
        return;
      }

      rows = result.data.map(r => ({
        email: (r.email ?? "").trim(),
        firstName: (r.firstName ?? r.first_name ?? "").trim(),
        lastName: (r.lastName ?? r.last_name ?? "").trim(),
        tier: (r.tier ?? "").trim() || defaultTier,
        qty: Math.max(1, parseInt(r.qty ?? "1", 10) || 1),
      }));
    }

    const invalid = rows.filter(r => !r.email);
    if (invalid.length > 0) {
      setParseError(`${invalid.length} ligne(s) sans email valide.`);
    }

    setPreview(rows.filter(r => r.email));
  }, [csv, defaultTier]);

  const totalTickets = preview.reduce((acc, r) => acc + r.qty, 0);

  const [step, setStep] = useState<string>("");

  const handleIssueAndSend = async () => {
    if (preview.length === 0) return;
    setIssueResult(null);
    setSendResult(null);
    setLoading("issue");

    // Step 1: Issue tickets
    setStep(`Émission de ${totalTickets} billet${totalTickets > 1 ? "s" : ""}…`);
    try {
      const issueRes = await fetch("/api/tickets/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, rows: preview }),
      });
      const issueData = await issueRes.json();
      setIssueResult(issueData);

      if (issueData.issued === 0 && !issueData.error) {
        // All duplicates — but still try to send any remaining "issued" tickets from previous imports
      }
    } catch (err) {
      setIssueResult({ issued: 0, errors: [String(err)] });
      setLoading(null);
      setStep("");
      return;
    }

    // Step 2: Send emails
    setLoading("send");
    let totalSent = 0, totalFailed = 0;
    const allErrors: string[] = [];
    let remaining = 1;
    try {
      while (remaining > 0) {
        setStep(`Envoi des emails… ${totalSent > 0 ? `(${totalSent} envoyé${totalSent > 1 ? "s" : ""})` : ""}`);
        const res = await fetch("/api/tickets/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_id: eventId }),
        });
        const data = await res.json();
        totalSent += data.sent ?? 0;
        totalFailed += data.failed ?? 0;
        allErrors.push(...(data.errors ?? []));
        remaining = data.remaining ?? 0;
        setSendResult({ sent: totalSent, failed: totalFailed, errors: allErrors });
      }
    } catch (err) {
      allErrors.push(String(err));
      setSendResult({ sent: totalSent, failed: totalFailed, errors: allErrors });
    } finally {
      setLoading(null);
      setStep("");
    }
  };

  return (
    <div className="space-y-6">
      {/* CSV Input */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-2">
          Liste des acheteurs
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none transition min-h-[160px] resize-y"
          placeholder={PLACEHOLDER}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        {parseError && (
          <p className="mt-2 text-sm text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> {parseError}
          </p>
        )}
      </div>

      {/* Tiers legend */}
      {tiers.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span>Catégories disponibles :</span>
          {tiers.map(t => (
            <span key={t.id} className="px-2 py-0.5 rounded-md bg-white/5 border border-zinc-800 font-mono text-zinc-300">
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-40 transition-colors"
        >
          <Eye className="w-4 h-4" /> Prévisualiser
        </button>
        <button
          type="button"
          onClick={handleIssueAndSend}
          disabled={preview.length === 0 || loading !== null}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-violet-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {step}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {totalTickets > 0 ? `Émettre et envoyer ${totalTickets} billet${totalTickets > 1 ? "s" : ""}` : "Émettre et envoyer"}
            </>
          )}
        </button>
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
            <div>Email</div>
            <div>Prénom</div>
            <div>Nom</div>
            <div>Catégorie</div>
            <div className="text-right">Qté</div>
          </div>
          <ul className="divide-y divide-zinc-800 bg-zinc-950">
            {preview.map((row, i) => (
              <li key={i} className="grid grid-cols-[1.5fr_1fr_1fr_auto_auto] items-center gap-3 px-4 py-2 hover:bg-white/[0.02] text-sm">
                <div className="text-zinc-300 truncate">{row.email}</div>
                <div className="text-zinc-400">{row.firstName}</div>
                <div className="text-zinc-400">{row.lastName}</div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-zinc-300 font-mono">{row.tier}</span>
                </div>
                <div className="text-right tabular-nums text-zinc-300">{row.qty}</div>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 text-xs text-zinc-500 border-t border-zinc-800 bg-zinc-900/50">
            {preview.length} ligne(s) — {totalTickets} billet(s) au total
          </div>
        </div>
      )}

      {/* Issue result */}
      {issueResult && (
        <div className={`rounded-xl p-4 text-sm border ${
          issueResult.errors.length > 0
            ? "border-amber-500/30 bg-amber-500/5 text-amber-300"
            : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
        }`}>
          <p className="font-semibold flex items-center gap-1.5">
            {issueResult.errors.length > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {issueResult.issued} billet(s) émis
            {issueResult.errors.length > 0 && ` — ${issueResult.errors.length} erreur(s)`}
          </p>
          {issueResult.errors.length > 0 && (
            <ul className="mt-2 ml-5 list-disc space-y-0.5 text-xs">
              {issueResult.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Send result */}
      {sendResult && (
        <div className={`rounded-xl p-4 text-sm border ${
          sendResult.failed > 0
            ? "border-red-500/30 bg-red-500/5 text-red-300"
            : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
        }`}>
          <p className="font-semibold flex items-center gap-1.5">
            {sendResult.failed > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {sendResult.sent} envoyé(s), {sendResult.failed} échec(s)
          </p>
          {sendResult.errors.length > 0 && (
            <ul className="mt-2 ml-5 list-disc space-y-0.5 text-xs">
              {sendResult.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
