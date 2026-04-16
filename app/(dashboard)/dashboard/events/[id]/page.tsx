"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Ticket,
  Settings,
  Share2,
  RefreshCw,
  Radio,
  TrendingUp,
  Send,
  UserCheck,
  AlertTriangle,
  Euro,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { ScanEntry } from "@/components/dashboard/RecentScans";

/* ─── Types ──────────────────────────────────────────────── */
interface TierStat {
  id?: string;
  name: string;
  issued: number;
  checkedIn: number;
  revenueCents: number;
  capacity?: number;
}

interface TimelineBucket {
  ts: string;
  count: number;
  cumulative: number;
}

interface StatsResponse {
  issued: number;
  sent: number;
  checkedIn: number;
  invalidAttempts: number;
  revenueCents: number;
  capacity: number;
  byTier: TierStat[];
  arrivalsTimeline: Array<{ ts: string; count: number; cumulative: number }>;
  recentScans: ScanEntry[];
}

/* ─── Helpers ────────────────────────────────────────────── */
function buildTimeline(raw: StatsResponse["arrivalsTimeline"]): TimelineBucket[] {
  let cumsum = 0;
  return raw.map((b) => {
    cumsum += b.count;
    return { ts: b.ts, count: b.count, cumulative: cumsum };
  });
}

function formatTick(ts: string) {
  return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function fmtEur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

/* ─── Tier colours ───────────────────────────────────────── */
const TIER_COLORS = ["#8B5CF6", "#FF4D6A", "#06B6D4", "#10B981", "#F59E0B"];

/* ─── Scan result helpers ────────────────────────────────── */
function resultLabel(r: string) {
  if (r === "ok") return "Validé";
  if (r === "duplicate") return "Doublon";
  if (r === "invalid") return "Invalide";
  if (r === "void") return "Annulé";
  return r;
}

function resultStyles(r: string) {
  if (r === "ok")
    return {
      pill: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
      dot: "bg-emerald-400",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    };
  if (r === "duplicate")
    return {
      pill: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
      dot: "bg-amber-400",
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
    };
  return {
    pill: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
    dot: "bg-red-400",
    icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  };
}

function initials(scan: ScanEntry & { firstName?: string | null; lastName?: string | null }) {
  const f = scan.firstName?.[0] ?? "";
  const l = scan.lastName?.[0] ?? "";
  if (f || l) return (f + l).toUpperCase();
  return scan.token_hint ? "?" : "—";
}

/* ─── Sub-components ─────────────────────────────────────── */

/** Large primary KPI */
function PrimaryKpi({
  value,
  label,
  sub,
  pct,
}: {
  value: number | string;
  label: string;
  sub?: string;
  pct?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#18181B] ring-1 ring-white/[0.06] p-7">
      {/* Subtle gradient accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 10% 0%, #FF4D6A22, transparent)",
        }}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 mb-3">
        {label}
      </p>
      <p
        className="font-display text-6xl font-bold leading-none text-zinc-100"
        style={{ fontFamily: '"Unbounded", "Space Grotesk", system-ui' }}
      >
        {value}
      </p>
      {sub && <p className="mt-3 text-sm text-zinc-400">{sub}</p>}
      {typeof pct === "number" && (
        <div className="mt-4">
          <div className="h-1 w-full rounded-full bg-white/[0.06]">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-700"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-zinc-500">{pct}% de la capacité</p>
        </div>
      )}
    </div>
  );
}

/** Secondary KPI card */
function SecondaryKpi({
  icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}) {
  return (
    <div
      className="rounded-xl bg-[#18181B] ring-1 ring-white/[0.06] p-5 flex items-start gap-4"
      style={{
        animation: `slideUpFade 0.4s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
      }}
    >
      <div className="mt-0.5 shrink-0 text-zinc-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-2xl font-bold text-zinc-100 tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function EventStatsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [eventName, setEventName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then(r => r.json()).then(d => {
      if (d.event?.name) setEventName(d.event.name);
    }).catch(() => {});
  }, [eventId]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hiddenRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (hiddenRef.current) return;
    try {
      const res = await fetch(`/api/events/${eventId}/stats`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Erreur lors du chargement");
        return;
      }
      const data: StatsResponse = await res.json();
      setStats(data);
      setLastRefresh(new Date());
      setError(null);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const ms = liveMode ? 3000 : 10000;
    intervalRef.current = setInterval(fetchStats, ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchStats, liveMode]);

  useEffect(() => {
    const handler = () => { hiddenRef.current = document.hidden; };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  const checkedIn = stats?.checkedIn ?? 0;
  const capacity = stats?.capacity ?? 0;
  const issued = stats?.issued ?? 0;
  const fillPct = capacity > 0 ? Math.round((checkedIn / capacity) * 100) : 0;
  const timeline: TimelineBucket[] = stats ? buildTimeline(stats.arrivalsTimeline) : [];
  const tierData = (stats?.byTier ?? []).map((t) => ({ name: t.name, value: t.issued }));
  const hasTimeline = timeline.length > 0;
  const hasTiers = tierData.length > 0;

  return (
    <>
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-1 pb-16 space-y-8">

        {/* ── Hero header ────────────────────────────────── */}
        <div
          className="pt-2"
          style={{ animation: "slideUpFade 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            {/* Left: title */}
            <div className="flex items-start gap-3">
              <div>
                {/* Eyebrow */}
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-1">
                  Tableau de bord
                </p>
                <h1
                  className="text-3xl font-bold text-zinc-100 leading-tight"
                  style={{ fontFamily: '"Space Grotesk", system-ui' }}
                >
                  {eventName || "Événement"}
                </h1>
                {lastRefresh && (
                  <p className="text-xs text-zinc-600 mt-1">
                    Mis à jour à {lastRefresh.toLocaleTimeString("fr-FR")}
                  </p>
                )}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Live toggle */}
              <button
                onClick={() => setLiveMode((v) => !v)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ring-1 ${
                  liveMode
                    ? "bg-red-500/10 text-red-400 ring-red-500/30"
                    : "bg-white/[0.04] text-zinc-400 ring-white/[0.06] hover:bg-white/[0.08]"
                }`}
              >
                <Radio
                  className={`w-3.5 h-3.5 ${liveMode ? "animate-pulse" : ""}`}
                />
                {liveMode ? "Live" : "Mode live"}
              </button>

              {/* Refresh */}
              <button
                onClick={fetchStats}
                disabled={loading}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] ring-1 ring-white/[0.06] transition-all duration-200 disabled:opacity-40"
                title="Actualiser"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              {/* Émettre billets */}
              <Link href={`/dashboard/events/${eventId}/tickets`}>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity duration-200">
                  <Ticket className="w-3.5 h-3.5" />
                  Émettre billets
                </button>
              </Link>

              {/* Partager */}
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] text-zinc-400 text-xs font-medium ring-1 ring-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-200 transition-all duration-200">
                <Share2 className="w-3.5 h-3.5" />
                Partager
              </button>
            </div>
          </div>
        </div>

        {/* ── Error ──────────────────────────────────────── */}
        {error && (
          <div className="rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ── KPIs ───────────────────────────────────────── */}
        {stats?.issued === 0 && !loading ? (
          /* Empty state */
          <div
            className="rounded-2xl bg-[#18181B] ring-1 ring-white/[0.06] px-8 py-12 text-center"
            style={{ animation: "slideUpFade 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 mb-4">
              <Zap className="w-6 h-6 text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
              Les stats décollent dès les premiers billets
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto mb-6">
              Émettez des billets pour voir les entrées, revenus et arrivées s'afficher ici en temps réel.
            </p>
            <Link href={`/dashboard/events/${eventId}/tickets`}>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                <Ticket className="w-4 h-4" />
                Émettre les premiers billets
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary KPI — visually dominant */}
            <div
              style={{ animation: "slideUpFade 0.4s cubic-bezier(0.22,1,0.36,1) 0.05s both" }}
            >
              <PrimaryKpi
                label="Entrées scannées"
                value={checkedIn}
                sub={capacity > 0 ? `sur ${capacity} places` : undefined}
                pct={capacity > 0 ? fillPct : undefined}
              />
            </div>

            {/* Secondary KPIs — 4-column grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SecondaryKpi
                icon={<Ticket className="w-4 h-4" />}
                label="Billets émis"
                value={issued}
                sub={capacity > 0 ? `/ ${capacity}` : undefined}
                delay={80}
              />
              <SecondaryKpi
                icon={<Send className="w-4 h-4" />}
                label="Envoyés"
                value={stats?.sent ?? 0}
                sub={issued > 0 ? `${Math.round(((stats?.sent ?? 0) / issued) * 100)} %` : undefined}
                delay={130}
              />
              <SecondaryKpi
                icon={<Euro className="w-4 h-4" />}
                label="Revenus"
                value={fmtEur(stats?.revenueCents ?? 0)}
                delay={180}
              />
              <SecondaryKpi
                icon={<AlertTriangle className="w-4 h-4" />}
                label="Invalides"
                value={stats?.invalidAttempts ?? 0}
                delay={230}
              />
            </div>
          </div>
        )}

        {/* ── Charts row ─────────────────────────────────── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          style={{ animation: "slideUpFade 0.45s cubic-bezier(0.22,1,0.36,1) 0.18s both" }}
        >
          {/* Arrivals — wider */}
          <div className="lg:col-span-3 rounded-2xl bg-[#18181B] ring-1 ring-white/[0.06] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1">
              Arrivées dans le temps
            </p>
            <p className="text-sm text-zinc-400 mb-5">Entrées cumulées</p>
            {hasTimeline ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline} margin={{ top: 4, right: 0, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="arrivalsGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="ts"
                    tickFormatter={formatTick}
                    tick={{ fontSize: 10, fill: "#52525b" }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={48}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#52525b" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    labelFormatter={(v) => formatTick(String(v))}
                    formatter={(v) => [v, "cumulatif"]}
                    contentStyle={{
                      background: "#27272a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "#d4d4d8",
                    }}
                    cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#arrivalsGrad2)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <TrendingUp className="w-8 h-8 text-zinc-700" />
                <p className="text-sm text-zinc-600">
                  Les arrivées s'afficheront lors des scans
                </p>
              </div>
            )}
          </div>

          {/* Tier donut — narrower */}
          <div className="lg:col-span-2 rounded-2xl bg-[#18181B] ring-1 ring-white/[0.06] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1">
              Tarifs
            </p>
            <p className="text-sm text-zinc-400 mb-5">Répartition des billets</p>
            {hasTiers ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {tierData.map((_, i) => (
                        <Cell key={i} fill={TIER_COLORS[i % TIER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [v, "billets"]}
                      contentStyle={{
                        background: "#27272a",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        fontSize: 12,
                        color: "#d4d4d8",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <ul className="mt-2 space-y-1.5">
                  {tierData.map((t, i) => (
                    <li key={t.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ background: TIER_COLORS[i % TIER_COLORS.length] }}
                        />
                        <span className="text-xs text-zinc-400 truncate">{t.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-zinc-300 tabular-nums shrink-0">
                        {t.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Users className="w-8 h-8 text-zinc-700" />
                <p className="text-sm text-zinc-600 text-center">
                  Les tarifs s'affichent après émission
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent scans activity feed ──────────────────── */}
        <div
          className="rounded-2xl bg-[#18181B] ring-1 ring-white/[0.06] p-6"
          style={{ animation: "slideUpFade 0.45s cubic-bezier(0.22,1,0.36,1) 0.26s both" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1">
                Activité
              </p>
              <h3 className="text-sm font-semibold text-zinc-200">Scans récents</h3>
            </div>
            {liveMode && (
              <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                En direct
              </span>
            )}
          </div>

          {(stats?.recentScans ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <UserCheck className="w-8 h-8 text-zinc-700" />
              <p className="text-sm text-zinc-600">
                Les scans s'afficheront ici en temps réel
              </p>
            </div>
          ) : (
            <ul className="space-y-1 max-h-72 overflow-y-auto -mx-1 px-1">
              {(stats?.recentScans ?? []).map((s, i) => {
                const rs = resultStyles(s.result);
                const scanWithName = s as ScanEntry & { firstName?: string | null; lastName?: string | null; tierName?: string | null };
                const init = initials(scanWithName);
                return (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors duration-150"
                    style={{
                      animation: `slideUpFade 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 30}ms both`,
                    }}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-zinc-300">{init}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {scanWithName.firstName && scanWithName.lastName
                          ? `${scanWithName.firstName} ${scanWithName.lastName}`
                          : s.token_hint
                          ? `Billet ···${s.token_hint}`
                          : "Anonyme"}
                      </p>
                      <p className="text-xs text-zinc-600 truncate">
                        {scanWithName.tierName && (
                          <span className="text-zinc-500">{scanWithName.tierName} · </span>
                        )}
                        {formatDistanceToNow(new Date(s.scanned_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>

                    {/* Status pill */}
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${rs.pill}`}
                    >
                      {rs.icon}
                      {resultLabel(s.result)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
