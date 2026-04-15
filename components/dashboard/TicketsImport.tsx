"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";

interface Tier {
  id: string;
  name: string;
  price_cents: number;
}

interface ParsedRow {
  email: string;
  firstName: string;
  lastName: string;
  tier: string;
  qty: number;
}

interface Props {
  eventId: string;
  tiers: Tier[];
}

const PLACEHOLDER = `email,firstName,lastName,tier,qty
alice@example.com,Alice,Dupont,VIP,1
bob@example.com,Bob,Martin,Standard,2`;

export function TicketsImport({ eventId, tiers }: Props) {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [issueResult, setIssueResult] = useState<{
    issued: number;
    errors: string[];
  } | null>(null);
  const [sendResult, setSendResult] = useState<{
    sent: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [loading, setLoading] = useState<"issue" | "send" | null>(null);

  const handlePreview = useCallback(() => {
    setParseError(null);
    setPreview([]);
    setIssueResult(null);
    setSendResult(null);

    if (!csv.trim()) {
      setParseError("Le champ CSV est vide.");
      return;
    }

    const result = Papa.parse<Record<string, string>>(csv.trim(), {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      setParseError(result.errors.map((e) => e.message).join(", "));
      return;
    }

    const rows: ParsedRow[] = result.data.map((r) => ({
      email: r.email?.trim() ?? "",
      firstName: r.firstName?.trim() ?? r.first_name?.trim() ?? "",
      lastName: r.lastName?.trim() ?? r.last_name?.trim() ?? "",
      tier: r.tier?.trim() ?? "",
      qty: Math.max(1, parseInt(r.qty ?? "1", 10) || 1),
    }));

    const invalid = rows.filter((r) => !r.email || !r.tier);
    if (invalid.length > 0) {
      setParseError(
        `${invalid.length} ligne(s) sans email ou catégorie valides.`
      );
    }

    setPreview(rows);
  }, [csv]);

  const totalTickets = preview.reduce((acc, r) => acc + r.qty, 0);

  const handleIssue = async () => {
    if (preview.length === 0) return;
    setLoading("issue");
    setIssueResult(null);
    setSendResult(null);

    try {
      const res = await fetch("/api/tickets/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, rows: preview }),
      });
      const data = await res.json();
      setIssueResult(data);
    } catch (err) {
      setIssueResult({ issued: 0, errors: [String(err)] });
    } finally {
      setLoading(null);
    }
  };

  const handleSend = async () => {
    setLoading("send");
    setSendResult(null);

    try {
      const res = await fetch("/api/tickets/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await res.json();
      setSendResult(data);
    } catch (err) {
      setSendResult({ sent: 0, failed: 0, errors: [String(err)] });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* CSV Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Coller le CSV (colonnes : email, firstName, lastName, tier, qty)
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-mono text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all min-h-[180px] resize-y"
          placeholder={PLACEHOLDER}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        {parseError && (
          <p className="mt-2 text-sm text-red-600">{parseError}</p>
        )}
      </div>

      {/* Tiers legend */}
      {tiers.length > 0 && (
        <div className="text-xs text-gray-500">
          Catégories disponibles :{" "}
          {tiers.map((t) => (
            <span
              key={t.id}
              className="inline-block mr-2 px-2 py-0.5 rounded bg-gray-100 font-mono"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePreview}
          className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Prévisualiser
        </button>
        <button
          type="button"
          onClick={handleIssue}
          disabled={preview.length === 0 || loading !== null}
          className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "issue"
            ? "Émission en cours…"
            : `Émettre ${totalTickets > 0 ? totalTickets : ""} billet${totalTickets !== 1 ? "s" : ""}`}
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={loading !== null}
          className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "send" ? "Envoi en cours…" : "Envoyer les emails"}
        </button>
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                {["Email", "Prénom", "Nom", "Catégorie", "Qté"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {preview.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{row.email}</td>
                  <td className="px-4 py-2 text-gray-800">{row.firstName}</td>
                  <td className="px-4 py-2 text-gray-800">{row.lastName}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded bg-gray-100 font-mono text-xs">
                      {row.tier}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-gray-500">
            {preview.length} ligne(s) — {totalTickets} billet(s) au total
          </p>
        </div>
      )}

      {/* Issue result */}
      {issueResult && (
        <div
          className={`rounded-xl p-4 text-sm ${
            issueResult.errors.length > 0
              ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
              : "bg-green-50 border border-green-200 text-green-800"
          }`}
        >
          <p className="font-semibold">
            {issueResult.issued} billet(s) émis
            {issueResult.errors.length > 0
              ? ` — ${issueResult.errors.length} erreur(s)`
              : ""}
          </p>
          {issueResult.errors.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {issueResult.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Send result */}
      {sendResult && (
        <div
          className={`rounded-xl p-4 text-sm ${
            sendResult.failed > 0
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-green-50 border border-green-200 text-green-800"
          }`}
        >
          <p className="font-semibold">
            {sendResult.sent} envoyé(s), {sendResult.failed} échec(s)
          </p>
          {sendResult.errors.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {sendResult.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
