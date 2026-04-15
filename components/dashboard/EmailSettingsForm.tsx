"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

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

export function EmailSettingsForm({ eventId }: Props) {
  const [settings, setSettings] = useState<Settings>({ provider: "getstage_default" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testRecipient, setTestRecipient] = useState("");

  // Form fields (secrets are write-only in the UI)
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
        setSaveMsg("Paramètres enregistrés.");
        // Clear secrets from local state after save
        setSmtpPassword("");
        setResendApiKey("");
        // Update has_* flags
        setSettings((prev) => ({
          ...prev,
          has_smtp_password: provider === "smtp" ? (smtpPassword ? true : prev.has_smtp_password) : false,
          has_resend_key: provider === "resend_custom" ? (resendApiKey ? true : prev.has_resend_key) : false,
        }));
      } else {
        setSaveMsg(`Erreur : ${data.error}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Paramètres e-mail</h2>
        <p className="text-sm text-gray-500">
          Configurez le fournisseur d'envoi d'e-mails pour cet événement.
        </p>
      </div>

      {/* Provider select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fournisseur</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as Provider)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
        >
          <option value="getstage_default">GetStage (défaut)</option>
          <option value="resend_custom">Resend (ma clé API)</option>
          <option value="smtp">SMTP personnalisé</option>
        </select>
      </div>

      {/* Common fields (hidden for getstage_default) */}
      {provider !== "getstage_default" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email expéditeur</label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="tickets@mondomaine.fr"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom expéditeur</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Mon Organisation"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To</label>
            <input
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="contact@mondomaine.fr"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
            />
          </div>
        </div>
      )}

      {/* Resend fields */}
      {provider === "resend_custom" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clé API Resend
            {settings.has_resend_key && (
              <span className="ml-2 text-xs text-emerald-600 font-normal">(clé enregistrée)</span>
            )}
          </label>
          <input
            type="password"
            value={resendApiKey}
            onChange={(e) => setResendApiKey(e.target.value)}
            placeholder={settings.has_resend_key ? "Laisser vide pour conserver" : "re_xxxxxxxxxxxxxxxx"}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm font-mono"
          />
        </div>
      )}

      {/* SMTP fields */}
      {provider === "smtp" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hôte SMTP</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="smtp-secure"
              type="checkbox"
              checked={smtpSecure}
              onChange={(e) => setSmtpSecure(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="smtp-secure" className="text-sm text-gray-700">
              Connexion sécurisée (SSL/TLS port 465)
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur SMTP</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe SMTP
                {settings.has_smtp_password && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">(enregistré)</span>
                )}
              </label>
              <input
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder={settings.has_smtp_password ? "Laisser vide pour conserver" : "••••••••"}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Enregistrer
        </button>
        {saveMsg && (
          <p className={`text-sm ${saveMsg.startsWith("Erreur") ? "text-red-600" : "text-emerald-600"}`}>
            {saveMsg}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Tester la configuration</h3>

        {/* Last test result */}
        {settings.last_test_at && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl mb-4 text-sm ${
              settings.last_test_ok
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {settings.last_test_ok ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {settings.last_test_ok ? "Dernier test réussi" : "Dernier test échoué"}
              </p>
              <p className="text-xs opacity-70 mt-0.5">
                {new Date(settings.last_test_at).toLocaleString("fr-FR")}
              </p>
              {settings.last_test_error && (
                <p className="text-xs mt-1 font-mono">{settings.last_test_error}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <input
            type="email"
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            placeholder="destinataire@exemple.fr"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
          />
          <button
            onClick={handleTest}
            disabled={testing || !testRecipient}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {testing && <Loader2 className="w-4 h-4 animate-spin" />}
            Envoyer test
          </button>
        </div>

        {testMsg && (
          <div
            className={`mt-3 flex items-center gap-2 text-sm ${
              testMsg.ok ? "text-emerald-600" : "text-red-600"
            }`}
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
    </div>
  );
}
