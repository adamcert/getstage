"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ticket, Settings, RefreshCw } from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ArrivalsChart } from "@/components/dashboard/ArrivalsChart";
import { TierDonut } from "@/components/dashboard/TierDonut";
import { RecentScans } from "@/components/dashboard/RecentScans";
import type { StatsData } from "@/components/dashboard/StatsCards";
import type { TimelineBucket } from "@/components/dashboard/ArrivalsChart";
import type { TierStat } from "@/components/dashboard/TierDonut";
import type { ScanEntry } from "@/components/dashboard/RecentScans";

interface StatsResponse {
  issued: number;
  sent: number;
  checkedIn: number;
  invalidAttempts: number;
  revenueCents: number;
  capacity: number;
  byTier: Array<{
    name: string;
    issued: number;
    checkedIn: number;
    revenueCents: number;
  }>;
  arrivalsTimeline: Array<{ ts: string; count: number; cumulative: number }>;
  recentScans: ScanEntry[];
}

function buildTimeline(raw: StatsResponse["arrivalsTimeline"]): TimelineBucket[] {
  let cumsum = 0;
  return raw.map((b) => {
    cumsum += b.count;
    return { ts: b.ts, count: b.count, cumulative: cumsum };
  });
}

export default function EventStatsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Polling
  useEffect(() => {
    const ms = liveMode ? 3000 : 10000;
    intervalRef.current = setInterval(fetchStats, ms);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStats, liveMode]);

  // Page Visibility API — pause when tab hidden
  useEffect(() => {
    const handler = () => {
      hiddenRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  const kpiData: StatsData = stats
    ? {
        issued: stats.issued,
        sent: stats.sent,
        checkedIn: stats.checkedIn,
        invalidAttempts: stats.invalidAttempts,
        revenueCents: stats.revenueCents,
        capacity: stats.capacity,
      }
    : { issued: 0, sent: 0, checkedIn: 0, invalidAttempts: 0, revenueCents: 0, capacity: 0 };

  const tierData: TierStat[] = (stats?.byTier ?? []).map((t) => ({
    name: t.name,
    issued: t.issued,
    checkedIn: t.checkedIn,
    revenueCents: t.revenueCents,
  }));

  const timeline: TimelineBucket[] = stats ? buildTimeline(stats.arrivalsTimeline) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tableau de bord — événement</h1>
            {lastRefresh && (
              <p className="text-xs text-gray-400 mt-0.5">
                Mis à jour {lastRefresh.toLocaleTimeString("fr-FR")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live mode toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm text-gray-600">Mode live</span>
            <button
              role="switch"
              aria-checked={liveMode}
              onClick={() => setLiveMode((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                liveMode ? "bg-violet-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  liveMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>

          {/* Manual refresh */}
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Nav buttons */}
          <Link href={`/dashboard/events/${eventId}/tickets`}>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Ticket className="w-4 h-4" />
              Billets
            </button>
          </Link>
          <Link href={`/dashboard/events/${eventId}/settings`}>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <StatsCards data={kpiData} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ArrivalsChart data={timeline} />
        <TierDonut data={tierData} />
      </div>

      {/* Recent scans */}
      <RecentScans data={stats?.recentScans ?? []} />
    </div>
  );
}
