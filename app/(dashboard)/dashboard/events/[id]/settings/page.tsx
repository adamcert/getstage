"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart2,
  Mail,
  Ticket,
  Users,
  Settings,
  MapPin,
  Calendar,
  Lock,
  Globe,
  Loader2,
  Plus,
  Trash2,
  UserPlus,
  Shield,
  ScanLine,
} from "lucide-react";
import { EmailSettingsForm } from "@/components/dashboard/EmailSettingsForm";

/* ─── Types ──────────────────────────────────────────────── */
interface EventData {
  id: string;
  name: string;
  slug: string;
  starts_at: string;
  ends_at: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  capacity: number;
  visibility: string;
}

interface TierData {
  id: string;
  name: string;
  price_cents: number;
  quantity_total: number;
  issued: number;
  checkedIn: number;
}

interface OrgData {
  id: string;
  user_id: string;
  role: string;
  email: string;
  created_at: string;
}

/* ─── Tab definition ─────────────────────────────────────── */
const TABS = [
  { id: "general", label: "Général", icon: Settings },
  { id: "email", label: "E-mail", icon: Mail },
  { id: "tickets", label: "Billets", icon: Ticket },
  { id: "access", label: "Accès", icon: Users },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ─── Helpers ────────────────────────────────────────────── */
function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
  });
}

function fmtEur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

/* ─── Section card ───────────────────────────────────────── */
function SectionCard({ title, description, action, children }: {
  title: string; description?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/60 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
          {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ─── Info row ───────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-800/40 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-zinc-800/60 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-zinc-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-500 mb-0.5">{label}</p>
        <p className="text-sm text-zinc-200">{value || "—"}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-40 gap-2 text-zinc-600">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Chargement…</span>
    </div>
  );
}

/* ─── Général tab ────────────────────────────────────────── */
function TabGeneral({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then(r => r.json())
      .then(data => setEvent(data.event))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <LoadingState />;
  if (!event) return <p className="text-sm text-zinc-500 text-center py-8">Événement introuvable</p>;

  const isPrivate = event.visibility === "private";

  return (
    <div className="space-y-4">
      <SectionCard title="Informations de l'événement">
        <div className="space-y-0">
          <InfoRow icon={Calendar} label="Nom" value={event.name} />
          <InfoRow icon={Calendar} label="Début" value={fmtDate(event.starts_at)} />
          <InfoRow icon={Calendar} label="Fin" value={fmtDate(event.ends_at)} />
          <InfoRow icon={MapPin} label="Lieu" value={[event.venue_name, event.venue_address, event.venue_city].filter(Boolean).join(", ")} />
          <InfoRow icon={isPrivate ? Lock : Globe} label="Visibilité" value={
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isPrivate ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}>
              {isPrivate ? <><Lock className="w-3 h-3" /> Privé</> : <><Globe className="w-3 h-3" /> Public</>}
            </span>
          } />
          <InfoRow icon={Users} label="Capacité" value={`${event.capacity} places`} />
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Billets tab ────────────────────────────────────────── */
function TabBillets({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${eventId}/stats`)
      .then(r => r.json())
      .then(data => {
        setTiers((data.byTier ?? []).map((t: TierData & { capacity?: number }) => ({
          ...t,
          quantity_total: t.capacity ?? t.quantity_total ?? 0,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <LoadingState />;

  if (tiers.length === 0) {
    return (
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/60 p-12 text-center">
        <Ticket className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm font-medium text-zinc-400 mb-1">Aucun tarif configuré</p>
        <p className="text-xs text-zinc-600">Les tarifs s'afficheront ici une fois les billets émis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tiers.map((tier) => {
        const pct = tier.quantity_total > 0 ? Math.round((tier.issued / tier.quantity_total) * 100) : 0;
        return (
          <div key={tier.id} className="rounded-2xl bg-zinc-900/60 border border-zinc-800/60 p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="font-semibold text-zinc-200">{tier.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {tier.price_cents > 0 ? fmtEur(tier.price_cents) : "Gratuit"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">{tier.issued}</p>
                <p className="text-xs text-zinc-500">/ {tier.quantity_total > 0 ? tier.quantity_total : "∞"} émis</p>
              </div>
            </div>
            {tier.quantity_total > 0 && (
              <>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 mb-2">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>{tier.checkedIn} scannés</span>
                  <span>{pct}%</span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Accès tab ──────────────────────────────────────────── */
function TabAcces({ eventId }: { eventId: string }) {
  const [organizers, setOrganizers] = useState<OrgData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<"scanner" | "owner">("scanner");
  const [addPassword, setAddPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchOrgs = () => {
    fetch(`/api/events/${eventId}/organizers`)
      .then(r => r.json())
      .then(data => setOrganizers(data.organizers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrgs(); }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
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
      fetchOrgs();
    } catch {
      setAddError("Erreur réseau");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (orgId: string) => {
    setDeleteLoading(orgId);
    try {
      await fetch(`/api/events/${eventId}/organizers/${orgId}`, { method: "DELETE" });
      fetchOrgs();
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <SectionCard
        title="Comptes ayant accès"
        description="Organisateurs et scanners liés à cet événement."
        action={
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/20 text-xs font-medium text-zinc-200 hover:from-primary-500/30 hover:to-secondary-500/30 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        }
      >
        {/* Add form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  placeholder="scanner@example.com"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-secondary-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1 block">Mot de passe</label>
                <input
                  type="text"
                  value={addPassword}
                  onChange={e => setAddPassword(e.target.value)}
                  placeholder="Auto-généré si vide"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-secondary-500/50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-2 block">Rôle</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddRole("scanner")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    addRole === "scanner"
                      ? "bg-zinc-700 text-zinc-100 border border-zinc-600"
                      : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  <ScanLine className="w-4 h-4" />
                  Scanner
                </button>
                <button
                  type="button"
                  onClick={() => setAddRole("owner")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    addRole === "owner"
                      ? "bg-zinc-700 text-zinc-100 border border-zinc-600"
                      : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Organisateur
                </button>
              </div>
            </div>
            {addError && <p className="text-xs text-red-400">{addError}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-secondary-500/20 border border-secondary-500/30 text-xs font-medium text-secondary-300 hover:bg-secondary-500/30 transition-all disabled:opacity-50"
              >
                {addLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Ajouter
              </button>
            </div>
          </form>
        )}

        {/* Organizer list */}
        <ul className="space-y-1">
          {organizers.map((org) => (
            <li key={org.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-800/40 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-zinc-300">
                  {(org.email?.[0] ?? "?").toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate">{org.email}</p>
                <p className="text-xs text-zinc-600">
                  Depuis {new Date(org.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                org.role === "owner"
                  ? "bg-secondary-500/10 text-secondary-400 border border-secondary-500/20"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
              }`}>
                {org.role === "owner" ? "Organisateur" : "Scanner"}
              </span>
              <button
                onClick={() => handleDelete(org.id)}
                disabled={deleteLoading === org.id}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Supprimer l'accès"
              >
                {deleteLoading === org.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

/* ─── Inner component ────────────────────────────────────── */
function SettingsInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;

  const rawTab = searchParams.get("tab") as TabId | null;
  const activeTab: TabId = rawTab && TABS.some(t => t.id === rawTab) ? rawTab : "general";

  function setTab(id: TabId) {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  return (
    <div className="max-w-5xl mx-auto px-1 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/events/${eventId}`}>
            <button className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-1">Paramètres</p>
            <h1 className="text-2xl font-bold text-zinc-100">Événement</h1>
          </div>
        </div>
        <Link href={`/dashboard/events/${eventId}`}>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/60 text-zinc-400 text-xs font-medium border border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200 transition-all">
            <BarChart2 className="w-3.5 h-3.5" />
            Statistiques
          </button>
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Sidebar tabs */}
        <aside className="hidden md:block w-52 shrink-0 sticky top-6">
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? "bg-zinc-800/80 text-zinc-100 border border-zinc-700/50"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-secondary-400" : "text-zinc-600"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden w-full mb-4">
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                    isActive ? "bg-zinc-800 text-zinc-100" : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" key={activeTab}>
          {activeTab === "general" && <TabGeneral eventId={eventId} />}
          {activeTab === "email" && (
            <SectionCard title="Paramètres e-mail" description="Fournisseur d'envoi pour les billets.">
              <EmailSettingsForm eventId={eventId} />
            </SectionCard>
          )}
          {activeTab === "tickets" && <TabBillets eventId={eventId} />}
          {activeTab === "access" && <TabAcces eventId={eventId} />}
        </div>
      </div>
    </div>
  );
}

export default function EventSettingsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SettingsInner />
    </Suspense>
  );
}
