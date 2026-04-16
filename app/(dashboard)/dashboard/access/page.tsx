import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AccessClient } from "./AccessClient";

export const dynamic = "force-dynamic";

export default async function AccessPage() {
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

  if (!owned?.event_id) redirect("/dashboard");

  return <AccessClient eventId={owned.event_id} />;
}
