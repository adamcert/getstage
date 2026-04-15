import "server-only";
import nodemailer from "nodemailer";
import type { EmailTransport, SendArgs } from "./index";

interface SmtpOpts {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
}

export function makeSmtpTransport(opts: SmtpOpts): EmailTransport {
  const transporter = nodemailer.createTransport({
    host: opts.host,
    port: opts.port,
    secure: opts.secure,
    auth: { user: opts.user, pass: opts.password },
  });
  const defaultFrom = opts.fromName ? `${opts.fromName} <${opts.fromEmail}>` : opts.fromEmail;

  return {
    async send(msg: SendArgs) {
      const info = await transporter.sendMail({
        from: msg.from || defaultFrom,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        replyTo: msg.replyTo ?? opts.replyTo,
        attachments: msg.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
          cid: a.cid,
          contentType: a.contentType,
        })),
      });
      return { id: info.messageId };
    },
    async test(to: string) {
      try {
        await transporter.verify();
        await this.send({
          to,
          from: defaultFrom,
          subject: "GetStage — email de test",
          html: "<p>Ton SMTP fonctionne ✅</p>",
          text: "Ton SMTP fonctionne ✅",
        });
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    },
  };
}
