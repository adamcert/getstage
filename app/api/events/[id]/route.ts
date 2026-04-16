export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await ctx.params;
  const admin = supabaseAdmin();

  const { data: ownerCheck } = await admin
    .from("organizers")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .in("role", ["owner", "scanner"])
    .maybeSingle();
  if (!ownerCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: event, error } = await admin
    .from("events")
    .select("id, name, slug, starts_at, ends_at, venue_name, venue_address, venue_city, capacity, visibility")
    .eq("id", eventId)
    .single();
  if (error || !event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ event });
}
