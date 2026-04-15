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
  ShieldCheck,
} from "lucide-react";
import { EmailSettingsForm } from "@/components/dashboard/EmailSettingsForm";

/* ─── Types ──────────────────────────────────────────────── */
interface EventData {
  id: string;
  name?: string;
  slug?: string;
  is_private?: boolean;
  venue?: string;
  starts_at?: string;
  ends_at?: string;
  cover_url?: string;
  capacity?: number;
}

interface TierData {
  id: string;
  name: string;
  price_cents: number;
  quantity_total: number;
  sort_order: number;
}

interface OrganizerData {
  id: string;
  role: string;
  created_at: string;
  user_email?: string;
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtEur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

/* ─── Section card ───────────────────────────────────────── */
function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#18181B] ring-1 ring-white/[0.06] p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

/* ─── Info row ───────────────────────────────────────────── */
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 mb-0.5">{label}</p>
        <p className="text-sm text-zinc-200">{value || "—"}</p>
      </div>
    </div>
  );
}

/* ─── Général tab ────────────────────────────────────────── */
function TabGeneral({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch event metadata from the stats endpoint (includes name/capacity)
    // We'll use a lightweight fetch from what we know is available
    fetch(`/api/events/${eventId}/stats`)
      .then((r) => r.json())
      .then((data) => {
        // Stats only has issued/sent etc; we'll show what we have
        setEvent({ id: eventId, capacity: data.capacity });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 gap-2 text-zinc-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Informations de l'événement"
        description="Ces informations sont gérées depuis la base de données. Contactez le support pour les modifier."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoRow icon={Calendar} label="Début" value="—" />
          <InfoRow icon={Calendar} label="Fin" value="—" />
          <InfoRow icon={MapPin} label="Lieu" value="—" />
          <InfoRow
            icon={event?.is_private ? Lock : Globe}
            label="Visibilité"
            value={
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  event?.is_private
                    ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                }`}
              >
                {event?.is_private ? (
                  <><Lock className="w-3 h-3" /> Privé</>
                ) : (
                  <><Globe className="w-3 h-3" /> Public</>
                )}
              </span>
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Capacité">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Places réservées</span>
              <span className="text-xs font-semibold text-zinc-300">
                — / {event?.capacity ?? "—"}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Cover placeholder */}
      <SectionCard title="Image de couverture" description="Modifier l'image depuis l'éditeur d'événement.">
        <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] h-32 flex items-center justify-center">
          <p className="text-xs text-zinc-600">Aucune image configurée</p>
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Billets tab ────────────────────────────────────────── */
function TabBillets({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [stats, setStats] = useState<Record<string, { issued: number; checkedIn: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${eventId}/stats`)
      .then((r) => r.json())
      .then((data) => {
        const byTier = data.byTier ?? [];
        const statsMap: Record<string, { issued: number; checkedIn: number }> = {};
        byTier.forEach((t: { id?: string; name: string; issued: number; checkedIn: number; revenueCents: number }) => {
          if (t.id) statsMap[t.id] = { issued: t.issued, checkedIn: t.checkedIn };
        });
        setStats(statsMap);
        // Build tier list from byTier
        setTiers(
          byTier.map((t: { id?: string; name: string; issued: number; checkedIn: number; revenueCents: number; capacity?: number; price_cents?: number; quantity_total?: number }, i: number) => ({
            id: t.id ?? `tier-${i}`,
            name: t.name,
            price_cents: t.price_cents ?? 0,
            quantity_total: t.capacity ?? t.quantity_total ?? 0,
            sort_order: i,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 gap-2 text-zinc-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <div className="rounded-2xl bg-[#18181B] ring-1 ring-white/[0.06] p-12 text-center">
        <Ticket className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm font-medium text-zinc-400 mb-1">Aucun tarif configuré</p>
        <p className="text-xs text-zinc-600">
          Les tarifs s'afficheront ici une fois les billets émis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tiers.map((tier) => {
        const tierStats = stats[tier.id] ?? { issued: 0, checkedIn: 0 };
        const pct =
          tier.quantity_total > 0
            ? Math.round((tierStats.issued / tier.quantity_total) * 100)
            : 0;
        return (
          <div
            key={tier.id}
            className="rounded-2xl bg-[#18181B] ring-1 ring-white/[0.06] p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="font-semibold text-zinc-200">{tier.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {tier.price_cents > 0 ? fmtEur(tier.price_cents) : "Gratuit"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {tierStats.issued}
                </p>
                <p className="text-xs text-zinc-500">
                  / {tier.quantity_total > 0 ? tier.quantity_total : "∞"} émis
                </p>
              </div>
            </div>

            {tier.quantity_total > 0 && (
              <>
                <div className="h-1 w-full rounded-full bg-white/[0.06] mb-2">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>{tierStats.checkedIn} scannés</span>
                  <span>{pct}% vendu</span>
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
  const [organizers, setOrganizers] = useState<OrganizerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No dedicated organizers API yet — show placeholder
    setLoading(false);
  }, [eventId]);

  const roleLabel = (role: string) => {
    if (role === "owner") return "Propriétaire";
    if (role === "scanner") return "Scanner";
    return role;
  };

  const roleStyle = (role: string) => {
    if (role === "owner")
      return "bg-secondary-500/10 text-secondary-400 ring-1 ring-secondary-500/20";
    return "bg-white/[0.06] text-zinc-400 ring-1 ring-white/[0.08]";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 gap-2 text-zinc-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Comptes ayant accès"
        description="Organisateurs et scanners liés à cet événement."
      >
        {organizers.length === 0 ? (
          <div className="py-8 text-center">
            <ShieldCheck className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-400 mb-1">
              Fonctionnalité bientôt disponible
            </p>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              La gestion des accès organisateur et scanner sera disponible dans la prochaine version.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {organizers.map((org) => (
              <li
                key={org.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-zinc-300">
                    {(org.user_email?.[0] ?? "?").toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{org.user_email ?? "—"}</p>
                  <p className="text-xs text-zinc-600">
                    Depuis{" "}
                    {new Date(org.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleStyle(org.role)}`}>
                  {roleLabel(org.role)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

/* ─── Inner component (uses useSearchParams) ─────────────── */
function SettingsInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;

  const rawTab = searchParams.get("tab") as TabId | null;
  const activeTab: TabId =
    rawTab && TABS.some((t) => t.id === rawTab) ? rawTab : "general";

  function setTab(id: TabId) {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  return (
    <div className="max-w-5xl mx-auto px-1 pb-16">
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 mb-8"
        style={{ animation: "slideUpFade 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/events/${eventId}`}>
            <button className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all duration-200">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-1">
              Paramètres
            </p>
            <h1
              className="text-2xl font-bold text-zinc-100 leading-tight"
              style={{ fontFamily: '"Space Grotesk", system-ui' }}
            >
              Événement
            </h1>
          </div>
        </div>

        <Link href={`/dashboard/events/${eventId}`}>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] text-zinc-400 text-xs font-medium ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-200 transition-all duration-200">
            <BarChart2 className="w-3.5 h-3.5" />
            Statistiques
          </button>
        </Link>
      </div>

      {/* ── Two-column layout ────────────────────────────── */}
      <div className="flex gap-6 items-start">

        {/* LEFT: sticky tab sidebar */}
        <aside
          className="hidden md:block w-52 shrink-0 sticky top-6"
          style={{ animation: "slideUpFade 0.4s cubic-bezier(0.22,1,0.36,1) 0.05s both" }}
        >
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600/20 to-secondary-600/20 text-zinc-100 ring-1 ring-white/[0.08]"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-secondary-400" : "text-zinc-600"
                    }`}
                  />
                  {tab.label}
                  {isActive && (
                    <span className="ml-auto w-1 h-4 rounded-full bg-gradient-to-b from-primary-500 to-secondary-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div
          className="md:hidden w-full mb-4"
          style={{ animation: "slideUpFade 0.4s cubic-bezier(0.22,1,0.36,1) 0.05s both" }}
        >
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600/30 to-secondary-600/30 text-zinc-100"
                      : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: content */}
        <div
          className="flex-1 min-w-0"
          key={activeTab}
          style={{ animation: "slideUpFade 0.3s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {activeTab === "general" && <TabGeneral eventId={eventId} />}

          {activeTab === "email" && (
            <div className="rounded-2xl bg-[#18181B] ring-1 ring-white/[0.06] p-6">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1">
                  Configuration
                </p>
                <h3 className="text-sm font-semibold text-zinc-200">
                  Paramètres e-mail
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Choisissez le fournisseur d'envoi pour les billets de cet événement.
                </p>
              </div>
              <EmailSettingsForm eventId={eventId} />
            </div>
          )}

          {activeTab === "tickets" && <TabBillets eventId={eventId} />}
          {activeTab === "access" && <TabAcces eventId={eventId} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Page export (wraps in Suspense for useSearchParams) ─── */
export default function EventSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-40 gap-2 text-zinc-600">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      }
    >
      <SettingsInner />
    </Suspense>
  );
}
