import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = supabaseAdmin();
  const { data: owned } = await admin
    .from("organizers")
    .select("event_id")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (owned?.event_id) {
    redirect(`/dashboard/events/${owned.event_id}`);
  }

  return (
    <div className="max-w-2xl mx-auto mt-24 px-6 text-center">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-violet-500/20 flex items-center justify-center">
        <CalendarDays className="w-7 h-7 text-violet-300" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-zinc-100">Aucun événement associé</h1>
      <p className="mt-2 text-zinc-500 max-w-md mx-auto">
        Votre compte n'est lié à aucun événement pour l'instant. Contactez l'équipe GetStage pour qu'on vous crée votre event, ou utilisez le script de seed en dev.
      </p>
      <p className="mt-4 text-xs text-zinc-600">Email connecté : <span className="text-zinc-400">{user.email}</span></p>
    </div>
  );
}
