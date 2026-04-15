import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TicketsImport } from "@/components/dashboard/TicketsImport";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TicketsPage({ params }: Props) {
  const { id: eventId } = await params;

  // 1. Auth — SSR client
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const admin = supabaseAdmin();

  // 2. Verify organizer ownership
  const { data: orgData } = await admin
    .from("organizers")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (!orgData) {
    redirect("/dashboard");
  }

  // 3. Load event
  const { data: event } = await admin
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .single();

  if (!event) {
    redirect("/dashboard");
  }

  // 4. Load tiers
  const { data: tiers } = await admin
    .from("ticket_tiers")
    .select("id, name, price_cents")
    .eq("event_id", eventId)
    .order("price_cents", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Billets — {event.title}
        </h1>
        <p className="mt-1 text-gray-500">
          Importez des participants en CSV, émettez les billets, puis envoyez
          les emails avec QR code.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <TicketsImport eventId={eventId} tiers={tiers ?? []} />
      </div>
    </div>
  );
}
