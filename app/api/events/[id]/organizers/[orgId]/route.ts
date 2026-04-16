export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{ id: string; orgId: string }>;
}

/** DELETE — remove an organizer */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId, orgId } = await ctx.params;
  const admin = supabaseAdmin();

  // Verify caller is owner
  const { data: ownerCheck } = await admin
    .from("organizers")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();
  if (!ownerCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Don't allow removing yourself
  const { data: target } = await admin
    .from("organizers")
    .select("user_id, role")
    .eq("id", orgId)
    .eq("event_id", eventId)
    .maybeSingle();
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.user_id === user.id) return NextResponse.json({ error: "Impossible de supprimer votre propre accès" }, { status: 400 });

  await admin.from("organizers").delete().eq("id", orgId);

  return NextResponse.json({ ok: true });
}
