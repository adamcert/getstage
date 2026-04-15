export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function resolveOwner(eventId: string, userId: string) {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("organizers")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .in("role", ["owner", "admin"])
    .maybeSingle();
  return { ok: !!data && !error, error };
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await ctx.params;
  const { ok } = await resolveOwner(eventId, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("event_email_settings")
    .select(
      "provider, from_email, from_name, reply_to, smtp_host, smtp_port, smtp_secure, smtp_user, resend_api_key_encrypted, smtp_password_encrypted, last_test_at, last_test_ok, last_test_error"
    )
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data) {
    return NextResponse.json({ provider: "getstage_default" });
  }

  // Redact secrets — expose only boolean flags
  return NextResponse.json({
    provider: data.provider,
    from_email: data.from_email,
    from_name: data.from_name,
    reply_to: data.reply_to,
    smtp_host: data.smtp_host,
    smtp_port: data.smtp_port,
    smtp_secure: data.smtp_secure,
    smtp_user: data.smtp_user,
    has_smtp_password: !!data.smtp_password_encrypted,
    has_resend_key: !!data.resend_api_key_encrypted,
    last_test_at: data.last_test_at,
    last_test_ok: data.last_test_ok,
    last_test_error: data.last_test_error,
  });
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await ctx.params;
  const { ok } = await resolveOwner(eventId, user.id);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    event_id: eventId,
    provider: body.provider,
    from_email: body.from_email ?? null,
    from_name: body.from_name ?? null,
    reply_to: body.reply_to ?? null,
  };

  if (body.provider === "smtp") {
    payload.smtp_host = body.smtp_host ?? null;
    payload.smtp_port = body.smtp_port ?? null;
    payload.smtp_secure = body.smtp_secure ?? false;
    payload.smtp_user = body.smtp_user ?? null;
    if (typeof body.smtp_password === "string" && body.smtp_password.length > 0) {
      payload.smtp_password_encrypted = encrypt(body.smtp_password);
    }
  }

  if (body.provider === "resend_custom") {
    if (typeof body.resend_api_key === "string" && body.resend_api_key.length > 0) {
      payload.resend_api_key_encrypted = encrypt(body.resend_api_key);
    }
  }

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("event_email_settings")
    .upsert(payload, { onConflict: "event_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
