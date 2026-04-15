import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TicketsImport } from "@/components/dashboard/TicketsImport";
import { TicketsList, type TicketRow } from "@/components/dashboard/TicketsList";
import { TicketsPageHeader } from "@/components/dashboard/TicketsPageHeader";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function TicketsPage({ params }: Props) {
  const { id: eventId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = supabaseAdmin();

  const { data: orgData } = await admin
    .from("organizers")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();
  if (!orgData) redirect("/dashboard");

  const { data: event } = await admin
    .from("events")
    .select("id, name, capacity")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) redirect("/dashboard");

  const { data: tiers } = await admin
    .from("ticket_tiers")
    .select("id, name, price_cents")
    .eq("event_id", eventId)
    .order("sort_order");

  const { data: ticketsRaw } = await admin
    .from("tickets")
    .select("id, token, short_code, buyer_email, buyer_first_name, buyer_last_name, tier_id, status, sent_at, checked_in_at, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  const tiersById = new Map((tiers ?? []).map(t => [t.id, t.name]));
  const tickets: TicketRow[] = (ticketsRaw ?? []).map(t => ({
    id: t.id,
    token: t.token,
    short_code: t.short_code,
    buyer_email: t.buyer_email,
    buyer_first_name: t.buyer_first_name,
    buyer_last_name: t.buyer_last_name,
    tier_name: tiersById.get(t.tier_id) ?? "—",
    status: t.status,
    sent_at: t.sent_at,
    checked_in_at: t.checked_in_at,
    created_at: t.created_at,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-1">Billets</p>
        <h1 className="text-3xl font-bold text-zinc-100" style={{ fontFamily: '"Space Grotesk", system-ui' }}>
          {event.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {tickets.length} billet{tickets.length > 1 ? "s" : ""} émis · capacité {event.capacity}
        </p>
      </div>

      <TicketsPageHeader eventId={eventId} tiers={tiers ?? []} />

      <TicketsList tickets={tickets} />
    </div>
  );
}
