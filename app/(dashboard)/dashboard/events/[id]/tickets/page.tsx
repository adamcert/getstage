import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TicketsImport } from "@/components/dashboard/TicketsImport";

interface Props {
  params: Promise<{ id: string }>;
}

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
    .select("id, name")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) redirect("/dashboard");

  const { data: tiers } = await admin
    .from("ticket_tiers")
    .select("id, name, price_cents")
    .eq("event_id", eventId)
    .order("sort_order");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`/dashboard/events/${eventId}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Émission & envoi des billets</h1>
        <p className="mt-1 text-zinc-500">
          Collez la liste des acheteurs, émettez les billets, puis envoyez les emails avec QR.
        </p>
        <p className="mt-1 text-sm text-zinc-600">Event : <span className="text-zinc-300 font-medium">{event.name}</span></p>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <TicketsImport eventId={eventId} tiers={tiers ?? []} />
      </div>
    </div>
  );
}
