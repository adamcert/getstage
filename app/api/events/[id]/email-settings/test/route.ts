export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";
import { makeResendTransport } from "@/lib/email/resend";
import { makeSmtpTransport } from "@/lib/email/smtp";
import type { EmailTransport } from "@/lib/email";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await ctx.params;
  const admin = supabaseAdmin();

  // Owner check
  const { data: orgRow } = await admin
    .from("organizers")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();
  if (!orgRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: {
    provider: string;
    testRecipient: string;
    from_email?: string;
    from_name?: string;
    reply_to?: string;
    smtp_host?: string;
    smtp_port?: number;
    smtp_secure?: boolean;
    smtp_user?: string;
    smtp_password?: string;
    resend_api_key?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.testRecipient) {
    return NextResponse.json({ error: "testRecipient is required" }, { status: 400 });
  }

  // Build transport from request body — do NOT persist config
  let transport: EmailTransport;

  try {
    if (body.provider === "smtp") {
      // Resolve password: use plaintext if provided, otherwise fall back to encrypted in DB
      let password = body.smtp_password ?? "";
      if (!password) {
        const { data: stored } = await admin
          .from("event_email_settings")
          .select("smtp_password_encrypted")
          .eq("event_id", eventId)
          .maybeSingle();
        if (stored?.smtp_password_encrypted) {
          password = decrypt(stored.smtp_password_encrypted);
        }
      }
      transport = makeSmtpTransport({
        host: body.smtp_host ?? "",
        port: body.smtp_port ?? 587,
        secure: body.smtp_secure ?? false,
        user: body.smtp_user ?? "",
        password,
        fromEmail: body.from_email ?? user.email ?? "test@example.com",
        fromName: body.from_name,
        replyTo: body.reply_to,
      });
    } else if (body.provider === "resend_custom") {
      let apiKey = body.resend_api_key ?? "";
      if (!apiKey) {
        const { data: stored } = await admin
          .from("event_email_settings")
          .select("resend_api_key_encrypted")
          .eq("event_id", eventId)
          .maybeSingle();
        if (stored?.resend_api_key_encrypted) {
          apiKey = decrypt(stored.resend_api_key_encrypted);
        }
      }
      transport = makeResendTransport({
        apiKey,
        fromEmail: body.from_email ?? "GetStage <onboarding@resend.dev>",
        fromName: body.from_name,
        replyTo: body.reply_to,
      });
    } else {
      // getstage_default
      transport = makeResendTransport({
        apiKey: process.env.RESEND_API_KEY!,
        fromEmail: "GetStage <onboarding@resend.dev>",
      });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Transport build error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  // Run the test
  const result = await transport.test(body.testRecipient);

  // Persist test outcome only (not the config)
  await admin
    .from("event_email_settings")
    .upsert(
      {
        event_id: eventId,
        provider: body.provider ?? "getstage_default",
        last_test_at: new Date().toISOString(),
        last_test_ok: result.ok,
        last_test_error: result.error ?? null,
      },
      { onConflict: "event_id" }
    );

  return NextResponse.json(result);
}
