import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/crypto";
import { makeResendTransport } from "./resend";
import { makeSmtpTransport } from "./smtp";

export interface SendArgs {
  to: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer; cid?: string; contentType?: string }[];
}

export interface EmailTransport {
  send(msg: SendArgs): Promise<{ id: string }>;
  test(to: string): Promise<{ ok: boolean; error?: string }>;
}

export async function getTransportForEvent(eventId: string): Promise<EmailTransport> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("event_email_settings")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle();
  if (error) throw error;

  const settings = data ?? { provider: "getstage_default" as const };

  if (settings.provider === "smtp") {
    return makeSmtpTransport({
      host: settings.smtp_host!,
      port: settings.smtp_port!,
      secure: settings.smtp_secure!,
      user: settings.smtp_user!,
      password: decrypt(settings.smtp_password_encrypted!),
      fromEmail: settings.from_email!,
      fromName: settings.from_name ?? undefined,
      replyTo: settings.reply_to ?? undefined,
    });
  }

  if (settings.provider === "resend_custom") {
    return makeResendTransport({
      apiKey: decrypt(settings.resend_api_key_encrypted!),
      fromEmail: settings.from_email!,
      fromName: settings.from_name ?? undefined,
      replyTo: settings.reply_to ?? undefined,
    });
  }

  // getstage_default
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return makeResendTransport({
    apiKey,
    fromEmail: "tickets@getstage.io",
    fromName: "GetStage",
    replyTo: undefined,
  });
}
