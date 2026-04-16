"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Trash2,
  Loader2,
  Plus,
  Shield,
  ScanLine,
  Users,
} from "lucide-react";

interface OrgData {
  id: string;
  user_id: string;
  role: string;
  email: string;
  created_at: string;
}

export default function AccessPage() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [organizers, setOrganizers] = useState<OrgData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<"scanner" | "owner">("scanner");
  const [addPassword, setAddPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Get event ID from bootstrap
  useEffect(() => {
    fetch("/api/scanner/bootstrap")
      .then(r => r.json())
      .then(data => {
        if (data.event?.id) setEventId(data.event.id);
      })
      .catch(() => {});
  }, []);

  const fetchOrgs = (eid: string) => {
    fetch(`/api/events/${eid}/organizers`)
      .then(r => r.json())
      .then(data => setOrganizers(data.organizers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (eventId) fetchOrgs(eventId);
  }, [eventId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/organizers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail, role: addRole, password: addPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error); return; }
      setAddEmail("");
      setAddPassword("");
      setShowAdd(false);
      fetchOrgs(eventId);
    } catch {
      setAddError("Erreur réseau");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (orgId: string) => {
    if (!eventId) return;
    setDeleteLoading(orgId);
    try {
      const res = await fetch(`/api/events/${eventId}/organizers/${orgId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok && data.error) {
        alert(data.error);
      } else {
        fetchOrgs(eventId);
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 gap-2 text-zinc-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Gestion des accès</h1>
          <p className="text-sm text-zinc-500 mt-1">Organisateurs et scanners liés à cet événement</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={addEmail}
                onChange={e => setAddEmail(e.target.value)}
                placeholder="scanner@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-secondary-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Mot de passe</label>
              <input
                type="text"
                value={addPassword}
                onChange={e => setAddPassword(e.target.value)}
                placeholder="Auto-généré si vide"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-secondary-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">Rôle</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAddRole("scanner")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  addRole === "scanner"
                    ? "bg-secondary-500/15 text-secondary-300 border border-secondary-500/30"
                    : "bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <ScanLine className="w-4 h-4" />
                Scanner
              </button>
              <button
                type="button"
                onClick={() => setAddRole("owner")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  addRole === "owner"
                    ? "bg-secondary-500/15 text-secondary-300 border border-secondary-500/30"
                    : "bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <Shield className="w-4 h-4" />
                Organisateur
              </button>
            </div>
          </div>

          {addError && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{addError}</div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-secondary-500/20 border border-secondary-500/30 text-sm font-semibold text-secondary-300 hover:bg-secondary-500/30 transition-all disabled:opacity-50"
            >
              {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Ajouter
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {organizers.length === 0 ? (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-12 text-center">
          <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-400">Aucun accès configuré</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800">
          {organizers.map((org) => (
            <div key={org.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-zinc-800/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-zinc-300">
                  {(org.email?.[0] ?? "?").toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{org.email}</p>
                <p className="text-xs text-zinc-600">
                  Ajouté le {new Date(org.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                org.role === "owner"
                  ? "bg-secondary-500/10 text-secondary-400 border border-secondary-500/20"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}>
                {org.role === "owner" ? "Organisateur" : "Scanner"}
              </span>
              <button
                onClick={() => handleDelete(org.id)}
                disabled={deleteLoading === org.id}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Supprimer"
              >
                {deleteLoading === org.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
