export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET — list all organizers for this event */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await ctx.params;
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

  // Get all organizers
  const { data: orgs, error } = await admin
    .from("organizers")
    .select("id, user_id, role, created_at")
    .eq("event_id", eventId)
    .order("created_at");
  if (error) return NextResponse.json({ error: "Internal error" }, { status: 500 });

  // Fetch email per user (avoid listUsers which loads ALL users)
  const result = await Promise.all((orgs ?? []).map(async (o) => {
    const { data } = await admin.auth.admin.getUserById(o.user_id);
    return {
      id: o.id,
      user_id: o.user_id,
      role: o.role,
      email: data.user?.email ?? "—",
      created_at: o.created_at,
    };
  }));

  return NextResponse.json({ organizers: result });
}

/** POST — add a new organizer (scanner or owner) */
export async function POST(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await ctx.params;
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

  let body: { email: string; role: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, role, password } = body;
  if (!email || !role) return NextResponse.json({ error: "Missing email or role" }, { status: 400 });
  if (!["owner", "scanner"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  // Find or create the auth user — try create first, handle existing
  const pwd = password || `GS-${crypto.randomUUID().slice(0, 12)}!`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: pwd,
    email_confirm: true,
  });

  let targetUserId: string;
  if (created?.user) {
    targetUserId = created.user.id;
  } else if (createError?.message?.includes("already been registered")) {
    const { data: { users: found } } = await admin.auth.admin.listUsers({ perPage: 50 });
    const existing = found.find(u => u.email === email);
    if (!existing) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 400 });
    targetUserId = existing.id;
  } else {
    return NextResponse.json({ error: "Erreur création utilisateur" }, { status: 400 });
  }

  // Check if already assigned
  const { data: alreadyAssigned } = await admin
    .from("organizers")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", targetUserId)
    .maybeSingle();
  if (alreadyAssigned) return NextResponse.json({ error: "Cet utilisateur a déjà accès" }, { status: 409 });

  // Insert organizer row
  const { error: insertError } = await admin.from("organizers").insert({
    event_id: eventId,
    user_id: targetUserId,
    role,
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ ok: true, email, role });
}
