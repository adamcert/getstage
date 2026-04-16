import "server-only";
import { Resend } from "resend";
import type { EmailTransport, SendArgs } from "./index";

interface ResendOpts {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
}

export function makeResendTransport(opts: ResendOpts): EmailTransport {
  const resend = new Resend(opts.apiKey);
  const defaultFrom = opts.fromName ? `${opts.fromName} <${opts.fromEmail}>` : opts.fromEmail;

  return {
    async send(msg: SendArgs) {
      const { data, error } = await resend.emails.send({
        from: msg.from || defaultFrom,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        replyTo: msg.replyTo ?? opts.replyTo,
        attachments: msg.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
          contentId: a.cid,
          contentType: a.contentType,
        })),
      });
      if (error) throw new Error(error.message);
      return { id: data!.id };
    },
    async test(to: string) {
      try {
        await this.send({
          to,
          from: defaultFrom,
          subject: "GetStage — email de test",
          html: "<p>Ton intégration email fonctionne ✅</p>",
          text: "Ton intégration email fonctionne ✅",
        });
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    },
  };
}
