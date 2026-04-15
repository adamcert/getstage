"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Key,
  Server,
  Send,
  ChevronRight,
} from "lucide-react";

type Provider = "getstage_default" | "resend_custom" | "smtp";

interface Settings {
  provider: Provider;
  from_email?: string;
  from_name?: string;
  reply_to?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  smtp_user?: string;
  has_smtp_password?: boolean;
  has_resend_key?: boolean;
  last_test_at?: string;
  last_test_ok?: boolean;
  last_test_error?: string;
}

interface Props {
  eventId: string;
}

/* ─── Provider card ──────────────────────────────────────── */
const PROVIDERS: Array<{
  id: Provider;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}> = [
  {
    id: "getstage_default",
    label: "GetStage",
    description: "Envoi via l'infrastructure GetStage. Zéro configuration.",
    icon: Zap,
    badge: "Recommandé",
  },
  {
    id: "resend_custom",
    label: "Resend",
    description: "Utilisez votre propre clé API Resend pour un domaine personnalisé.",
    icon: Key,
  },
  {
    id: "smtp",
    label: "SMTP",
    description: "Connectez n'importe quel serveur SMTP existant.",
    icon: Server,
  },
];

/* ─── Input field ────────────────────────────────────────── */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-600">{hint}</p>}
    </div>
  );
}

function TextInput({
  type = "text",
  value,
  onChange,
  placeholder,
  mono,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:ring-secondary-500/50 focus:outline-none transition-all duration-200 ${mono ? "font-mono" : ""}`}
    />
  );
}

/* ─── Main component ─────────────────────────────────────── */
export function EmailSettingsForm({ eventId }: Props) {
  const [settings, setSettings] = useState<Settings>({ provider: "getstage_default" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testRecipient, setTestRecipient] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const [provider, setProvider] = useState<Provider>("getstage_default");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}/email-settings`)
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data);
        setProvider(data.provider ?? "getstage_default");
        setFromEmail(data.from_email ?? "");
        setFromName(data.from_name ?? "");
        setReplyTo(data.reply_to ?? "");
        setSmtpHost(data.smtp_host ?? "");
        setSmtpPort(data.smtp_port?.toString() ?? "587");
        setSmtpSecure(data.smtp_secure ?? false);
        setSmtpUser(data.smtp_user ?? "");
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  function markDirty() {
    setIsDirty(true);
    setSaveMsg(null);
  }

  function handleProviderChange(p: Provider) {
    setProvider(p);
    markDirty();
  }

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const body: Record<string, unknown> = {
        provider,
        from_email: fromEmail || null,
        from_name: fromName || null,
        reply_to: replyTo || null,
      };
      if (provider === "smtp") {
        body.smtp_host = smtpHost;
        body.smtp_port = parseInt(smtpPort, 10) || 587;
        body.smtp_secure = smtpSecure;
        body.smtp_user = smtpUser;
        if (smtpPassword) body.smtp_password = smtpPassword;
      }
      if (provider === "resend_custom") {
        if (resendApiKey) body.resend_api_key = resendApiKey;
      }
      const res = await fetch(`/api/events/${eventId}/email-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg({ ok: true, text: "Paramètres enregistrés avec succès." });
        setSmtpPassword("");
        setResendApiKey("");
        setIsDirty(false);
        setSettings((prev) => ({
          ...prev,
          has_smtp_password:
            provider === "smtp" ? (smtpPassword ? true : prev.has_smtp_password) : false,
          has_resend_key:
            provider === "resend_custom"
              ? (resendApiKey ? true : prev.has_resend_key)
              : false,
        }));
      } else {
        setSaveMsg({ ok: false, text: `Erreur : ${data.error}` });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testRecipient) return;
    setTesting(true);
    setTestMsg(null);
    try {
      const body: Record<string, unknown> = {
        provider,
        testRecipient,
        from_email: fromEmail || null,
        from_name: fromName || null,
        reply_to: replyTo || null,
      };
      if (provider === "smtp") {
        body.smtp_host = smtpHost;
        body.smtp_port = parseInt(smtpPort, 10) || 587;
        body.smtp_secure = smtpSecure;
        body.smtp_user = smtpUser;
        if (smtpPassword) body.smtp_password = smtpPassword;
      }
      if (provider === "resend_custom") {
        if (resendApiKey) body.resend_api_key = resendApiKey;
      }
      const res = await fetch(`/api/events/${eventId}/email-settings/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setTestMsg({ ok: true, text: "Email de test envoyé avec succès." });
      } else {
        setTestMsg({ ok: false, text: data.error ?? "Échec de l'envoi." });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleCancel = () => {
    // Reset to saved state
    setProvider(settings.provider);
    setFromEmail(settings.from_email ?? "");
    setFromName(settings.from_name ?? "");
    setReplyTo(settings.reply_to ?? "");
    setSmtpHost(settings.smtp_host ?? "");
    setSmtpPort(settings.smtp_port?.toString() ?? "587");
    setSmtpSecure(settings.smtp_secure ?? false);
    setSmtpUser(settings.smtp_user ?? "");
    setSmtpPassword("");
    setResendApiKey("");
    setIsDirty(false);
    setSaveMsg(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 gap-2 text-zinc-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Chargement…</span>
      </div>
    );
  }

  const showCommonFields = provider !== "getstage_default";

  return (
    <div className="space-y-8">

      {/* ── Provider selector ─── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          Fournisseur d'envoi
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PROVIDERS.map((p) => {
            const Icon = p.icon;
            const isActive = provider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                className={`relative text-left p-4 rounded-2xl ring-1 transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-br from-primary-600/10 to-secondary-600/10 ring-secondary-500/40"
                    : "bg-white/[0.03] ring-white/[0.06] hover:bg-white/[0.06] hover:ring-white/[0.12]"
                }`}
              >
                {p.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                    {p.badge}
                  </span>
                )}
                <Icon
                  className={`w-5 h-5 mb-3 ${
                    isActive ? "text-secondary-400" : "text-zinc-600"
                  }`}
                />
                <p
                  className={`text-sm font-semibold mb-1 ${
                    isActive ? "text-zinc-100" : "text-zinc-300"
                  }`}
                >
                  {p.label}
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">{p.description}</p>
                {isActive && (
                  <div className="absolute bottom-3 right-3">
                    <div className="w-2 h-2 rounded-full bg-secondary-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Common fields (animated) ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: showCommonFields ? "1fr" : "0fr",
          transition: "grid-template-rows 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email expéditeur">
                <TextInput
                  type="email"
                  value={fromEmail}
                  onChange={(v) => { setFromEmail(v); markDirty(); }}
                  placeholder="tickets@mondomaine.fr"
                />
              </Field>
              <Field label="Nom expéditeur">
                <TextInput
                  value={fromName}
                  onChange={(v) => { setFromName(v); markDirty(); }}
                  placeholder="Mon Organisation"
                />
              </Field>
            </div>
            <Field label="Reply-To" hint="Adresse de réponse pour vos destinataires">
              <TextInput
                type="email"
                value={replyTo}
                onChange={(v) => { setReplyTo(v); markDirty(); }}
                placeholder="contact@mondomaine.fr"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Resend key (animated) ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: provider === "resend_custom" ? "1fr" : "0fr",
          transition: "grid-template-rows 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="pt-1">
            <Field
              label="Clé API Resend"
              hint={
                settings.has_resend_key
                  ? "Une clé est déjà configurée. Laissez vide pour la conserver."
                  : undefined
              }
            >
              <div className="relative">
                <TextInput
                  type="password"
                  value={resendApiKey}
                  onChange={(v) => { setResendApiKey(v); markDirty(); }}
                  placeholder={settings.has_resend_key ? "••••••••••••••••" : "re_xxxxxxxxxxxxxxxx"}
                  mono
                />
                {settings.has_resend_key && !resendApiKey && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Enregistrée
                  </span>
                )}
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* ── SMTP fields (animated) ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: provider === "smtp" ? "1fr" : "0fr",
          transition: "grid-template-rows 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Field label="Hôte SMTP">
                  <TextInput
                    value={smtpHost}
                    onChange={(v) => { setSmtpHost(v); markDirty(); }}
                    placeholder="smtp.example.com"
                  />
                </Field>
              </div>
              <Field label="Port">
                <TextInput
                  type="number"
                  value={smtpPort}
                  onChange={(v) => { setSmtpPort(v); markDirty(); }}
                  placeholder="587"
                />
              </Field>
            </div>

            {/* SSL toggle */}
            <div className="flex items-center gap-3">
              <button
                role="switch"
                aria-checked={smtpSecure}
                onClick={() => { setSmtpSecure((v) => !v); markDirty(); }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  smtpSecure
                    ? "bg-gradient-to-r from-primary-500 to-secondary-500"
                    : "bg-white/[0.12]"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    smtpSecure ? "translate-x-4.5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-sm text-zinc-400">
                Connexion sécurisée SSL/TLS (port 465)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Utilisateur SMTP">
                <TextInput
                  value={smtpUser}
                  onChange={(v) => { setSmtpUser(v); markDirty(); }}
                  placeholder="user@example.com"
                />
              </Field>
              <Field
                label="Mot de passe SMTP"
                hint={
                  settings.has_smtp_password
                    ? "Laissez vide pour conserver le mot de passe actuel."
                    : undefined
                }
              >
                <div className="relative">
                  <TextInput
                    type="password"
                    value={smtpPassword}
                    onChange={(v) => { setSmtpPassword(v); markDirty(); }}
                    placeholder={settings.has_smtp_password ? "••••••••" : "Mot de passe"}
                    mono
                  />
                  {settings.has_smtp_password && !smtpPassword && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Enregistré
                    </span>
                  )}
                </div>
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* ── Save feedback ─── */}
      {saveMsg && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ring-1 ${
            saveMsg.ok
              ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
              : "bg-red-500/10 text-red-400 ring-red-500/20"
          }`}
        >
          {saveMsg.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
          {saveMsg.text}
        </div>
      )}

      {/* ── Sticky footer save bar ─── */}
      {isDirty && (
        <div
          className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-[#27272a] ring-1 ring-white/[0.08]"
          style={{ animation: "slideUpFade 0.25s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <p className="text-xs text-zinc-500">Modifications non enregistrées</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all duration-200 disabled:opacity-40"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* ── Divider ─── */}
      <div className="border-t border-white/[0.06]" />

      {/* ── Test section ─── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
          Tester la configuration
        </p>

        {/* Last test result */}
        {settings.last_test_at && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl mb-5 ring-1 ${
              settings.last_test_ok
                ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                : "bg-red-500/10 text-red-400 ring-red-500/20"
            }`}
          >
            {settings.last_test_ok ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold">
                {settings.last_test_ok ? "Dernier test réussi" : "Dernier test échoué"}
              </p>
              <p className="text-xs opacity-70 mt-0.5">
                {new Date(settings.last_test_at).toLocaleString("fr-FR")}
              </p>
              {settings.last_test_error && (
                <p className="text-xs mt-1 font-mono opacity-80">{settings.last_test_error}</p>
              )}
            </div>
          </div>
        )}

        {/* Test input + button */}
        <div className="flex gap-3">
          <input
            type="email"
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            placeholder="destinataire@exemple.fr"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:ring-secondary-500/50 focus:outline-none transition-all duration-200"
          />
          <button
            onClick={handleTest}
            disabled={testing || !testRecipient}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] ring-1 ring-white/[0.10] text-sm font-semibold text-zinc-200 hover:bg-white/[0.10] transition-all duration-200 disabled:opacity-40 whitespace-nowrap"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Envoyer test
          </button>
        </div>

        {/* Test result */}
        {testMsg && (
          <div
            className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ring-1 ${
              testMsg.ok
                ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                : "bg-red-500/10 text-red-400 ring-red-500/20"
            }`}
            style={{ animation: "slideUpFade 0.25s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {testMsg.ok ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            {testMsg.text}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
