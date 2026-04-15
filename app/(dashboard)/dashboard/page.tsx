import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, Users, Ticket, UserCheck, ArrowRight, Plus, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = supabaseAdmin();

  const { data: ownedRows } = await admin
    .from("organizers")
    .select("event_id, events(id, name, slug, starts_at, venue_name, venue_city, capacity, visibility, cover_image_url)")
    .eq("user_id", user.id)
    .eq("role", "owner");

  const events = (ownedRows ?? [])
    .map(r => (r as any).events)
    .filter(Boolean) as Array<{
      id: string; name: string; slug: string; starts_at: string;
      venue_name: string; venue_city: string; capacity: number;
      visibility: "public" | "private"; cover_image_url: string | null;
    }>;

  const eventIds = events.map(e => e.id);
  let counts = new Map<string, { issued: number; sent: number; checkedIn: number }>();
  if (eventIds.length) {
    const { data: tix } = await admin
      .from("tickets")
      .select("event_id, status, sent_at")
      .in("event_id", eventIds);
    for (const t of tix ?? []) {
      const c = counts.get(t.event_id) ?? { issued: 0, sent: 0, checkedIn: 0 };
      c.issued++;
      if (t.sent_at) c.sent++;
      if (t.status === "checked_in") c.checkedIn++;
      counts.set(t.event_id, c);
    }
  }

  const totalIssued = Array.from(counts.values()).reduce((s, c) => s + c.issued, 0);
  const totalCheckedIn = Array.from(counts.values()).reduce((s, c) => s + c.checkedIn, 0);
  const totalSent = Array.from(counts.values()).reduce((s, c) => s + c.sent, 0);

  const kpis = [
    { label: "Événements", value: events.length, icon: CalendarDays },
    { label: "Billets émis", value: totalIssued, icon: Ticket },
    { label: "Emails envoyés", value: totalSent, icon: Users },
    { label: "Entrées scannées", value: totalCheckedIn, icon: UserCheck },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Bienvenue sur votre Dashboard</h1>
        <p className="mt-1 text-zinc-500">Gérez vos événements et suivez vos ventes en temps réel.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">{k.label}</span>
              <k.icon className="w-4 h-4 text-zinc-600" />
            </div>
            <div className="mt-2 text-3xl font-bold text-zinc-100 tabular-nums">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-100">Mes événements</h2>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-12 text-center">
          <CalendarDays className="w-10 h-10 text-zinc-700 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-300">Aucun événement pour l'instant</h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
            Contactez votre administrateur GetStage pour qu'il vous crée un événement, ou utilisez le script de seed en dev.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => {
            const c = counts.get(ev.id) ?? { issued: 0, sent: 0, checkedIn: 0 };
            const pct = ev.capacity > 0 ? Math.round((c.issued / ev.capacity) * 100) : 0;
            return (
              <Link
                key={ev.id}
                href={`/dashboard/events/${ev.id}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 transition-all overflow-hidden"
              >
                {ev.cover_image_url ? (
                  <div className="aspect-[16/9] bg-zinc-900 overflow-hidden">
                    <img src={ev.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-red-500/20 to-violet-500/20" />
                )}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-100 truncate">{ev.name}</h3>
                      {ev.visibility === "private" && (
                        <EyeOff className="w-3.5 h-3.5 text-zinc-500 shrink-0" aria-label="privé" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {format(new Date(ev.starts_at), "EEEE d MMMM yyyy · HH'h'mm", { locale: fr })}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">{ev.venue_name} · {ev.venue_city}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>{c.issued} / {ev.capacity} billets</span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-violet-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-zinc-500">{c.checkedIn} entrées scannées</span>
                    <span className="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-100 transition-colors">
                      Ouvrir <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
