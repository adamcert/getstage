# GetStage Live — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shipper en 24-36h un système complet permettant à un organisateur d'importer une liste d'acheteurs, d'émettre et envoyer des billets nominatifs par email (BYOD SMTP/Resend custom possible), et de scanner les QR codes à l'entrée en mode offline-first, avec un dashboard stats temps réel — pour la release party du 22 avril 2026.

**Architecture:** Next.js 16 App Router + Supabase (DB + Auth + RLS) + Resend/nodemailer pour l'envoi, `html5-qrcode` + Dexie pour le scanner PWA offline-first, `recharts` pour le dashboard. Tout le code sensible passe par des server actions avec service_role. Events privés filtrés côté DB via RLS.

**Tech Stack:** Next.js 16.1, React 19, TypeScript 5, Supabase, Resend SDK, nodemailer, @react-email/components, qrcode, nanoid, papaparse, dexie, html5-qrcode, recharts, zustand, tailwind 4.

---

## File Structure

### À créer

| Fichier | Responsabilité |
|---|---|
| `supabase/migrations/20260415000001_getstage_live.sql` | Schéma DB + RLS + RPC |
| `scripts/seed-event.ts` | Seed event + tiers + comptes orga/scanner |
| `scripts/seed-fixture.json` | Fixture d'event pour le seed |
| `lib/crypto.ts` | `encrypt()`/`decrypt()` AES-256-GCM pour secrets |
| `lib/crypto.test.ts` | Tests chiffrement |
| `lib/ticket-codes.ts` | Génération `token` (nanoid) + `short_code` |
| `lib/ticket-codes.test.ts` | Tests formats |
| `lib/qr.ts` | `generateQrPng(data)` → Buffer PNG |
| `lib/email/index.ts` | Interface `EmailTransport` + `getTransportForEvent()` |
| `lib/email/resend.ts` | Impl Resend |
| `lib/email/smtp.ts` | Impl nodemailer |
| `lib/email/email.test.ts` | Tests transport abstraction |
| `emails/TicketEmail.tsx` | Template React Email |
| `lib/supabase/admin.ts` | Client Supabase service_role (server only) |
| `lib/csv-parser.ts` | Parse CSV/TSV de la liste acheteurs |
| `lib/csv-parser.test.ts` | Tests parser |
| `app/api/tickets/issue/route.ts` | POST : émet N tickets |
| `app/api/tickets/send/route.ts` | POST : envoie emails |
| `app/api/checkin/route.ts` | POST : valide un scan |
| `app/api/scanner/bootstrap/route.ts` | GET : liste tokens pour IndexedDB |
| `app/api/events/[id]/stats/route.ts` | GET : snapshot stats |
| `app/api/events/[id]/email-settings/route.ts` | GET/PUT : settings |
| `app/api/events/[id]/email-settings/test/route.ts` | POST : test email |
| `app/(dashboard)/dashboard/events/[id]/page.tsx` | **Stats dashboard** |
| `app/(dashboard)/dashboard/events/[id]/tickets/page.tsx` | Import + émission |
| `app/(dashboard)/dashboard/events/[id]/settings/page.tsx` | Email settings UI |
| `app/t/[token]/page.tsx` | Page billet publique |
| `app/scan/layout.tsx` | Layout scanner (meta PWA) |
| `app/scan/login/page.tsx` | Login scanner |
| `app/scan/page.tsx` | Scanner principal + compteur |
| `components/dashboard/StatsCards.tsx` | 6 KPIs |
| `components/dashboard/ArrivalsChart.tsx` | Area chart arrivées |
| `components/dashboard/TierDonut.tsx` | Donut répartition tiers |
| `components/dashboard/RecentScans.tsx` | Liste live scans |
| `components/dashboard/TicketsImport.tsx` | Textarea + preview + émettre |
| `components/dashboard/EmailSettingsForm.tsx` | Formulaire provider |
| `components/scanner/LiveCounter.tsx` | Compteur X/capacity |
| `components/scanner/ScanFeedback.tsx` | UI verte/orange/rouge |
| `components/scanner/ScannerView.tsx` | Webcam + logique |
| `components/ticket/TicketCard.tsx` | Carte billet (réutilisée /t/ + email) |
| `lib/scanner/db.ts` | Wrapper Dexie (IndexedDB) |
| `lib/scanner/sync.ts` | Queue + flush |
| `types/scanner.ts` | Types scanner |

### À modifier

| Fichier | Changement |
|---|---|
| `middleware.ts` | Étendre pour protéger `/scan` + rediriger `/scan/login` |
| `package.json` | Ajouter dépendances, scripts `seed`, `test` |
| `components/home/demo-home.tsx` | Filtrer events `visibility=public` |
| `app/event/[slug]/page.tsx` | 404 si `visibility=private` |
| `app/search/page.tsx` | Filtrer `visibility=public` |
| `lib/supabase/server.ts` | Export helper typé |
| `.env.local` | Ajouter `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_SECRETS_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL` |

---

## Phase 0 — Dépendances & env

### Task 0.1: Installer les dépendances npm

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Installer runtime deps**

```bash
cd /Users/adam/getstage && npm install resend nodemailer @react-email/components @react-email/render qrcode nanoid papaparse dexie html5-qrcode recharts
```

- [ ] **Step 2: Installer dev deps (types + test runner)**

```bash
cd /Users/adam/getstage && npm install -D @types/nodemailer @types/qrcode @types/papaparse vitest @vitest/ui tsx
```

- [ ] **Step 3: Ajouter scripts dans package.json**

Modifier la section `scripts` pour :
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest",
  "seed:event": "tsx scripts/seed-event.ts"
}
```

- [ ] **Step 4: Vérifier install**

```bash
cd /Users/adam/getstage && npm ls resend nodemailer dexie html5-qrcode recharts | head
```

Attendu : toutes listées sans `UNMET`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add deps for live tickets mvp (resend, nodemailer, dexie, html5-qrcode, recharts)"
```

### Task 0.2: Configurer `.env.local`

**Files:**
- Modify: `.env.local` (créer si absent)

- [ ] **Step 1: Récupérer les URL+keys Supabase existantes**

```bash
cd /Users/adam/getstage && vercel env pull .env.local
```

- [ ] **Step 2: Ajouter les variables manquantes**

Ajouter à la fin de `.env.local` :
```
SUPABASE_SERVICE_ROLE_KEY=<à demander à l'utilisateur>
EMAIL_SECRETS_KEY=<32 bytes base64, généré ci-dessous>
RESEND_API_KEY=<à remplir quand resend créé>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 3: Générer `EMAIL_SECRETS_KEY`**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copier la valeur dans `.env.local`.

- [ ] **Step 4: Ajouter `.env.local` au .gitignore (si pas déjà)**

```bash
grep -q "^.env.local$" .gitignore || echo ".env.local" >> .gitignore
```

- [ ] **Step 5: PAS de commit** (secrets dans `.env.local`)

### Task 0.3: Config Vitest

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Créer `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add vitest config"
```

---

## Phase 1 — Schéma DB & migrations

### Task 1.1: Créer la migration Supabase

**Files:**
- Create: `supabase/migrations/20260415000001_getstage_live.sql`

- [ ] **Step 1: Créer le fichier migration avec le schéma complet**

Le contenu est exactement celui de la section "Data Model" du spec :
`docs/superpowers/specs/2026-04-15-getstage-live-design.md` (sections SQL : tables events, ticket_tiers, tickets, check_ins, organizers, event_email_settings + les ENUM + index + RLS policies + RPC `get_ticket_by_token`).

Copier **tout le SQL** de la section "Data Model" du spec dans ce fichier de migration, dans l'ordre : ENUM → tables → index → policies → RPC.

- [ ] **Step 2: Vérifier la syntaxe**

```bash
cd /Users/adam/getstage && cat supabase/migrations/20260415000001_getstage_live.sql | head -80
```

- [ ] **Step 3: Appliquer la migration sur le projet Supabase**

Option A (CLI) :
```bash
cd /Users/adam/getstage && npx supabase link --project-ref <project-ref>
npx supabase db push
```

Option B (Dashboard Supabase — recommandé pour MVP rapide) :
- Ouvrir https://supabase.com/dashboard/project/<project-id>/sql/new
- Coller le contenu de la migration
- Cliquer "Run"

- [ ] **Step 4: Vérifier les tables en DB**

Dans le SQL editor :
```sql
SELECT tablename FROM pg_tables WHERE schemaname='public'
  AND tablename IN ('events','ticket_tiers','tickets','check_ins','organizers','event_email_settings');
```

Attendu : 6 lignes.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260415000001_getstage_live.sql
git commit -m "feat(db): add getstage live schema (events, tickets, check-ins, organizers, email settings)"
```

### Task 1.2: Admin client Supabase

**Files:**
- Create: `lib/supabase/admin.ts`

- [ ] **Step 1: Créer le client service_role**

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error("Missing SUPABASE env vars for admin client");
}

export function supabaseAdmin() {
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/supabase/admin.ts
git commit -m "feat(supabase): add admin client (service_role)"
```

---

## Phase 2 — Utils core (TDD)

### Task 2.1: Chiffrement secrets (AES-256-GCM)

**Files:**
- Create: `lib/crypto.ts`
- Test: `lib/crypto.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./crypto";

process.env.EMAIL_SECRETS_KEY = "zFq8pXJ4W5YxQ2cJ8rW6wH9tK1NmB3vR7xL2aE0uP5c=";

describe("crypto", () => {
  it("roundtrips a string", () => {
    const plain = "re_abc123_verySecretApiKey";
    const cipher = encrypt(plain);
    expect(cipher).not.toBe(plain);
    expect(cipher).toMatch(/^v1:/);
    expect(decrypt(cipher)).toBe(plain);
  });

  it("produces different ciphertext for same input (random IV)", () => {
    expect(encrypt("hello")).not.toBe(encrypt("hello"));
  });

  it("throws on tampered ciphertext", () => {
    const c = encrypt("hello");
    const tampered = c.slice(0, -2) + "xx";
    expect(() => decrypt(tampered)).toThrow();
  });
});
```

- [ ] **Step 2: Lancer le test — doit échouer**

```bash
cd /Users/adam/getstage && npx vitest run lib/crypto.test.ts
```

Attendu : FAIL (module introuvable).

- [ ] **Step 3: Implémenter**

```ts
import "server-only";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const KEY = Buffer.from(process.env.EMAIL_SECRETS_KEY || "", "base64");
if (KEY.length !== 32) {
  // En production on throw ; en test on tolère la clé du test
  if (process.env.NODE_ENV === "production") {
    throw new Error("EMAIL_SECRETS_KEY must be 32 bytes base64");
  }
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decrypt(payload: string): string {
  const parts = payload.split(":");
  if (parts[0] !== "v1" || parts.length !== 4) throw new Error("invalid ciphertext");
  const iv = Buffer.from(parts[1], "base64");
  const tag = Buffer.from(parts[2], "base64");
  const enc = Buffer.from(parts[3], "base64");
  const decipher = createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}
```

- [ ] **Step 4: Lancer le test — doit passer**

```bash
cd /Users/adam/getstage && npx vitest run lib/crypto.test.ts
```

Attendu : 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/crypto.ts lib/crypto.test.ts
git commit -m "feat(crypto): add aes-256-gcm encrypt/decrypt for email secrets"
```

### Task 2.2: Génération tokens et short_codes

**Files:**
- Create: `lib/ticket-codes.ts`
- Test: `lib/ticket-codes.test.ts`

- [ ] **Step 1: Écrire les tests**

```ts
import { describe, it, expect } from "vitest";
import { generateToken, generateShortCode } from "./ticket-codes";

describe("ticket-codes", () => {
  it("generateToken returns a URL-safe 24-char string", () => {
    const t = generateToken();
    expect(t).toHaveLength(24);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generateToken is unique across 1000 iterations", () => {
    const set = new Set(Array.from({ length: 1000 }, () => generateToken()));
    expect(set.size).toBe(1000);
  });

  it("generateShortCode matches TKT-XXXX-XXXX", () => {
    const c = generateShortCode();
    expect(c).toMatch(/^TKT-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });
});
```

- [ ] **Step 2: Lancer — FAIL attendu**

```bash
cd /Users/adam/getstage && npx vitest run lib/ticket-codes.test.ts
```

- [ ] **Step 3: Implémenter**

```ts
import { customAlphabet } from "nanoid";
import { randomBytes } from "crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
const nano24 = customAlphabet(alphabet, 24);

export function generateToken(): string {
  return nano24();
}

export function generateShortCode(): string {
  const bytes = randomBytes(4).toString("hex").toUpperCase();
  return `TKT-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}`;
}
```

- [ ] **Step 4: Lancer — PASS**

```bash
cd /Users/adam/getstage && npx vitest run lib/ticket-codes.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/ticket-codes.ts lib/ticket-codes.test.ts
git commit -m "feat: add token + short_code generation"
```

### Task 2.3: QR generator

**Files:**
- Create: `lib/qr.ts`

- [ ] **Step 1: Implémenter**

```ts
import QRCode from "qrcode";

export async function generateQrPng(data: string, size = 400): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    type: "png",
    width: size,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

export async function generateQrDataUrl(data: string, size = 400): Promise<string> {
  return QRCode.toDataURL(data, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
```

- [ ] **Step 2: Vérifier compile**

```bash
cd /Users/adam/getstage && npx tsc --noEmit --pretty
```

- [ ] **Step 3: Commit**

```bash
git add lib/qr.ts
git commit -m "feat: add QR code generator (PNG buffer + data URL)"
```

### Task 2.4: CSV/TSV parser (TDD)

**Files:**
- Create: `lib/csv-parser.ts`
- Test: `lib/csv-parser.test.ts`

- [ ] **Step 1: Écrire les tests**

```ts
import { describe, it, expect } from "vitest";
import { parseBuyerList } from "./csv-parser";

describe("parseBuyerList", () => {
  it("parses tab-separated paste from Google Sheet", () => {
    const input = `email\tfirstName\tlastName\ttier\tqty
adam@test.com\tAdam\tCerthis\tEarly Bird\t2
jane@x.com\tJane\tDoe\tStandard\t1`;
    const { rows, errors } = parseBuyerList(input);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ email: "adam@test.com", firstName: "Adam", lastName: "Certhis", tier: "Early Bird", qty: 2 });
    expect(rows[1].qty).toBe(1);
    expect(errors).toEqual([]);
  });

  it("parses comma-separated CSV", () => {
    const input = `email,firstName,lastName,tier,qty
a@b.c,John,Smith,VIP,3`;
    const { rows } = parseBuyerList(input);
    expect(rows[0].qty).toBe(3);
  });

  it("reports invalid emails with row index", () => {
    const input = `email,firstName,lastName,tier,qty
not-an-email,X,Y,Early,1`;
    const { errors } = parseBuyerList(input);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/email/i);
  });

  it("defaults qty to 1 if missing", () => {
    const input = `email,firstName,lastName,tier
a@b.c,X,Y,VIP`;
    const { rows } = parseBuyerList(input);
    expect(rows[0].qty).toBe(1);
  });

  it("trims whitespace", () => {
    const input = `email,firstName,lastName,tier,qty
  a@b.c  , X ,Y, Early ,2`;
    const { rows } = parseBuyerList(input);
    expect(rows[0].email).toBe("a@b.c");
    expect(rows[0].firstName).toBe("X");
    expect(rows[0].tier).toBe("Early");
  });
});
```

- [ ] **Step 2: Lancer — FAIL**

```bash
cd /Users/adam/getstage && npx vitest run lib/csv-parser.test.ts
```

- [ ] **Step 3: Implémenter**

```ts
import Papa from "papaparse";

export interface BuyerRow {
  email: string;
  firstName: string;
  lastName: string;
  tier: string;
  qty: number;
}

export interface ParseResult {
  rows: BuyerRow[];
  errors: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseBuyerList(input: string): ParseResult {
  const looksTab = input.includes("\t");
  const result = Papa.parse<Record<string, string>>(input.trim(), {
    header: true,
    delimiter: looksTab ? "\t" : ",",
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const rows: BuyerRow[] = [];
  const errors: string[] = [];

  result.data.forEach((raw, i) => {
    const email = (raw.email ?? "").trim();
    const firstName = (raw.firstName ?? "").trim();
    const lastName = (raw.lastName ?? "").trim();
    const tier = (raw.tier ?? "").trim();
    const qtyRaw = (raw.qty ?? "1").trim();
    const qty = parseInt(qtyRaw, 10) || 1;

    if (!EMAIL_RE.test(email)) {
      errors.push(`Ligne ${i + 2} : email invalide "${email}"`);
      return;
    }
    if (!firstName || !lastName) {
      errors.push(`Ligne ${i + 2} : prénom ou nom manquant`);
      return;
    }
    if (!tier) {
      errors.push(`Ligne ${i + 2} : tier manquant`);
      return;
    }

    rows.push({ email, firstName, lastName, tier, qty });
  });

  return { rows, errors };
}
```

- [ ] **Step 4: Lancer — PASS**

```bash
cd /Users/adam/getstage && npx vitest run lib/csv-parser.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/csv-parser.ts lib/csv-parser.test.ts
git commit -m "feat: add buyer list CSV/TSV parser with validation"
```

### Task 2.5: Email transport abstraction

**Files:**
- Create: `lib/email/index.ts`
- Create: `lib/email/resend.ts`
- Create: `lib/email/smtp.ts`
- Test: `lib/email/email.test.ts`

- [ ] **Step 1: Définir l'interface**

Fichier `lib/email/index.ts` :
```ts
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
  return makeResendTransport({
    apiKey: process.env.RESEND_API_KEY!,
    fromEmail: "GetStage <onboarding@resend.dev>",
    replyTo: undefined,
  });
}
```

- [ ] **Step 2: Impl Resend**

Fichier `lib/email/resend.ts` :
```ts
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
```

- [ ] **Step 3: Impl SMTP**

Fichier `lib/email/smtp.ts` :
```ts
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
```

- [ ] **Step 4: Écrire un smoke test (mocké)**

Fichier `lib/email/email.test.ts` :
```ts
import { describe, it, expect, vi } from "vitest";

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "msg_123" }, error: null }),
    },
  })),
}));

import { makeResendTransport } from "./resend";

describe("resend transport", () => {
  it("send returns an id", async () => {
    const t = makeResendTransport({ apiKey: "k", fromEmail: "a@b.c" });
    const r = await t.send({ to: "x@y.z", from: "a@b.c", subject: "S", html: "<p>h</p>" });
    expect(r.id).toBe("msg_123");
  });

  it("test returns ok true", async () => {
    const t = makeResendTransport({ apiKey: "k", fromEmail: "a@b.c" });
    const r = await t.test("x@y.z");
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 5: Lancer**

```bash
cd /Users/adam/getstage && npx vitest run lib/email/email.test.ts
```

Attendu : 2 PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/email lib/supabase/admin.ts
git commit -m "feat(email): add transport abstraction with resend + smtp impls"
```

### Task 2.6: Template React Email

**Files:**
- Create: `emails/TicketEmail.tsx`

- [ ] **Step 1: Implémenter le template**

```tsx
import { Body, Container, Head, Html, Img, Preview, Section, Text, Button, Hr } from "@react-email/components";
import * as React from "react";

interface Props {
  firstName: string;
  eventName: string;
  eventDate: string;           // formatted "Samedi 22 Avril 2026 · 23:00"
  venueName: string;
  venueAddress: string;
  tierName: string;
  shortCode: string;
  ticketUrl: string;
  qrCid: string;               // "qr@getstage" — matches attachment cid
  organizerName?: string;
}

export function TicketEmail({
  firstName, eventName, eventDate, venueName, venueAddress,
  tierName, shortCode, ticketUrl, qrCid, organizerName,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Ton billet pour {eventName}</Preview>
      <Body style={{ background: "#0B0B0F", color: "#fff", fontFamily: "Inter, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 700, background: "linear-gradient(90deg,#EF4444,#8B5CF6)", WebkitBackgroundClip: "text", color: "transparent" }}>
            GetStage
          </Text>
          <Text style={{ fontSize: 18, marginTop: 24 }}>Bonjour {firstName},</Text>
          <Text>Ton billet pour <strong>{eventName}</strong> est confirmé.</Text>

          <Section style={{ background: "#17171D", borderRadius: 12, padding: 20, marginTop: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{eventName}</Text>
            <Text style={{ color: "#9CA3AF", margin: "4px 0" }}>{eventDate}</Text>
            <Text style={{ color: "#9CA3AF", margin: "4px 0" }}>{venueName} — {venueAddress}</Text>
            <Hr style={{ borderColor: "#27272F", margin: "16px 0" }} />
            <Text style={{ margin: "4px 0" }}><strong>Catégorie :</strong> {tierName}</Text>
            <Text style={{ margin: "4px 0", fontFamily: "monospace", fontSize: 12, color: "#9CA3AF" }}>{shortCode}</Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: 24 }}>
            <Img src={`cid:${qrCid}`} width="220" height="220" alt="QR" style={{ borderRadius: 12 }} />
          </Section>

          <Section style={{ textAlign: "center", marginTop: 16 }}>
            <Button href={ticketUrl} style={{ background: "linear-gradient(90deg,#EF4444,#8B5CF6)", color: "#fff", padding: "12px 24px", borderRadius: 999, textDecoration: "none", fontWeight: 600 }}>
              Ouvrir mon billet
            </Button>
          </Section>

          <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 32, textAlign: "center" }}>
            Billet nominatif — pièce d'identité demandée à l'entrée.<br />
            {organizerName ? `Vendu par GetStage pour ${organizerName}.` : "Vendu par GetStage."}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: Compile check**

```bash
cd /Users/adam/getstage && npx tsc --noEmit --pretty
```

- [ ] **Step 3: Commit**

```bash
git add emails/TicketEmail.tsx
git commit -m "feat(email): add TicketEmail react-email template"
```

---

## Phase 3 — Seed script + fixture

### Task 3.1: Fixture JSON + seed script

**Files:**
- Create: `scripts/seed-fixture.json`
- Create: `scripts/seed-event.ts`

- [ ] **Step 1: Créer la fixture (à adapter avec les vraies infos quand dispo)**

```json
{
  "event": {
    "slug": "release-party-2026-04-22",
    "name": "Release Party — Client TBD",
    "description": "Release party privée",
    "starts_at": "2026-04-22T20:00:00+02:00",
    "ends_at": "2026-04-23T02:00:00+02:00",
    "venue_name": "Venue TBD",
    "venue_address": "Adresse TBD",
    "venue_city": "Paris",
    "cover_image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200",
    "capacity": 300,
    "visibility": "private"
  },
  "tiers": [
    { "name": "Early Bird",  "price_cents": 2000, "quantity_total": 100, "sort_order": 1 },
    { "name": "Standard",    "price_cents": 3000, "quantity_total": 150, "sort_order": 2 },
    { "name": "VIP",         "price_cents": 6000, "quantity_total":  50, "sort_order": 3 }
  ],
  "organizer": {
    "email": "orga@example.com",
    "password": "CHANGE_ME_BEFORE_PROD",
    "display_name": "Orga Release Party"
  },
  "scanners": [
    { "email": "scan1@example.com", "password": "CHANGE_ME_BEFORE_PROD", "display_name": "Porte 1" },
    { "email": "scan2@example.com", "password": "CHANGE_ME_BEFORE_PROD", "display_name": "Porte 2" }
  ]
}
```

- [ ] **Step 2: Implémenter le seed script**

```ts
#!/usr/bin/env tsx
import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const fixturePath = resolve(process.cwd(), "scripts/seed-fixture.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function ensureUser(email: string, password: string) {
  const { data: list } = await sb.auth.admin.listUsers();
  const existing = list.users.find(u => u.email === email);
  if (existing) return existing;
  const { data, error } = await sb.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

async function main() {
  console.log("→ Seeding event:", fixture.event.name);

  // 1. Event (upsert par slug)
  const { data: ev, error: e1 } = await sb
    .from("events")
    .upsert(fixture.event, { onConflict: "slug" })
    .select()
    .single();
  if (e1) throw e1;
  console.log("✓ Event:", ev.id);

  // 2. Tiers
  await sb.from("ticket_tiers").delete().eq("event_id", ev.id);
  const { data: tiers, error: e2 } = await sb
    .from("ticket_tiers")
    .insert(fixture.tiers.map((t: any) => ({ ...t, event_id: ev.id })))
    .select();
  if (e2) throw e2;
  console.log(`✓ ${tiers!.length} tiers`);

  // 3. Organizer
  const orga = await ensureUser(fixture.organizer.email, fixture.organizer.password);
  await sb.from("organizers").upsert({
    user_id: orga!.id, event_id: ev.id, role: "owner",
    display_name: fixture.organizer.display_name,
  }, { onConflict: "user_id,event_id" });
  console.log("✓ Organizer:", fixture.organizer.email);

  // 4. Scanners
  for (const s of fixture.scanners) {
    const u = await ensureUser(s.email, s.password);
    await sb.from("organizers").upsert({
      user_id: u!.id, event_id: ev.id, role: "scanner",
      display_name: s.display_name,
    }, { onConflict: "user_id,event_id" });
    console.log("✓ Scanner:", s.email);
  }

  // 5. Email settings default
  await sb.from("event_email_settings").upsert({
    event_id: ev.id, provider: "getstage_default",
  });

  console.log(`\n✅ Done. Event URL: http://localhost:3000/dashboard/events/${ev.id}`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Exécuter le seed**

```bash
cd /Users/adam/getstage && npm run seed:event
```

Attendu : logs ✓ pour event, tiers, organizer, 2 scanners.

- [ ] **Step 4: Vérifier en DB (SQL editor)**

```sql
SELECT e.name, COUNT(t.id) AS tiers, COUNT(DISTINCT o.user_id) AS users
FROM events e
LEFT JOIN ticket_tiers t ON t.event_id = e.id
LEFT JOIN organizers o ON o.event_id = e.id
WHERE e.slug = 'release-party-2026-04-22'
GROUP BY e.id;
```

Attendu : 1 ligne, 3 tiers, 3 users.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-event.ts scripts/seed-fixture.json
git commit -m "feat: add seed script for event + tiers + orga + scanners"
```

---

## Phase 4 — API: émission et envoi tickets

### Task 4.1: `/api/tickets/issue`

**Files:**
- Create: `app/api/tickets/issue/route.ts`

- [ ] **Step 1: Implémenter**

```ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateToken, generateShortCode } from "@/lib/ticket-codes";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { event_id, rows } = await req.json();
  if (!event_id || !Array.isArray(rows)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Auth : vérifie que l'utilisateur est owner de cet event
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();
  const { data: orga } = await sb
    .from("organizers")
    .select("role")
    .eq("user_id", user.id)
    .eq("event_id", event_id)
    .eq("role", "owner")
    .maybeSingle();
  if (!orga) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Charge les tiers
  const { data: tiers } = await sb.from("ticket_tiers").select("*").eq("event_id", event_id);
  const tierByName = new Map(tiers!.map(t => [t.name.toLowerCase(), t]));

  const toInsert: any[] = [];
  const errors: string[] = [];

  for (const r of rows) {
    const tier = tierByName.get(String(r.tier).toLowerCase());
    if (!tier) { errors.push(`Tier inconnu: "${r.tier}"`); continue; }
    for (let i = 0; i < (r.qty || 1); i++) {
      toInsert.push({
        event_id,
        tier_id: tier.id,
        buyer_email: r.email,
        buyer_first_name: r.firstName,
        buyer_last_name: r.lastName,
        token: generateToken(),
        short_code: generateShortCode(),
        status: "issued",
      });
    }
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ issued: 0, errors }, { status: 400 });
  }

  const { error: insertError } = await sb.from("tickets").insert(toInsert);
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ issued: toInsert.length, errors });
}
```

- [ ] **Step 2: Smoke test (curl après seed + login)**

Pour tester, il faut un cookie session (sera fait via l'UI en task suivante). Skip pour l'instant, sera validé au smoke test final.

- [ ] **Step 3: Commit**

```bash
git add app/api/tickets/issue/route.ts
git commit -m "feat(api): POST /api/tickets/issue — create tickets in bulk"
```

### Task 4.2: `/api/tickets/send`

**Files:**
- Create: `app/api/tickets/send/route.ts`

- [ ] **Step 1: Implémenter**

```ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getTransportForEvent } from "@/lib/email";
import { TicketEmail } from "@/emails/TicketEmail";
import { render } from "@react-email/render";
import { generateQrPng } from "@/lib/qr";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { event_id } = await req.json();

  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();
  const { data: orga } = await sb
    .from("organizers").select("role")
    .eq("user_id", user.id).eq("event_id", event_id).eq("role", "owner").maybeSingle();
  if (!orga) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: event } = await sb.from("events").select("*").eq("id", event_id).single();
  const { data: tickets } = await sb
    .from("tickets")
    .select("*, ticket_tiers(name)")
    .eq("event_id", event_id)
    .eq("status", "issued");

  if (!tickets || tickets.length === 0) {
    return NextResponse.json({ sent: 0, message: "no tickets to send" });
  }

  const transport = await getTransportForEvent(event_id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const eventDate = format(new Date(event!.starts_at), "EEEE d MMMM yyyy · HH'h'mm", { locale: fr });

  let sent = 0;
  const errors: { ticket_id: string; error: string }[] = [];

  for (const t of tickets) {
    try {
      const ticketUrl = `${appUrl}/t/${t.token}`;
      const qrBuffer = await generateQrPng(t.token);
      const html = await render(
        TicketEmail({
          firstName: t.buyer_first_name,
          eventName: event!.name,
          eventDate,
          venueName: event!.venue_name,
          venueAddress: event!.venue_address,
          tierName: (t as any).ticket_tiers.name,
          shortCode: t.short_code,
          ticketUrl,
          qrCid: "qr@getstage",
        })
      );

      await transport.send({
        to: t.buyer_email,
        from: "",  // transport applique le default
        subject: `Ton billet — ${event!.name}`,
        html,
        text: `Ton billet pour ${event!.name} : ${ticketUrl}`,
        attachments: [
          { filename: "qr.png", content: qrBuffer, cid: "qr@getstage", contentType: "image/png" },
        ],
      });

      await sb.from("tickets").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", t.id);
      sent++;
    } catch (e: any) {
      errors.push({ ticket_id: t.id, error: e.message });
    }
  }

  return NextResponse.json({ sent, failed: errors.length, errors });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/tickets/send/route.ts
git commit -m "feat(api): POST /api/tickets/send — send emails with QR"
```

---

## Phase 5 — UI dashboard : import + émission

### Task 5.1: Page `/dashboard/events/[id]/tickets`

**Files:**
- Create: `app/(dashboard)/dashboard/events/[id]/tickets/page.tsx`
- Create: `components/dashboard/TicketsImport.tsx`

- [ ] **Step 1: Composant import (client)**

Fichier `components/dashboard/TicketsImport.tsx` :
```tsx
"use client";
import { useState } from "react";
import { parseBuyerList, type BuyerRow } from "@/lib/csv-parser";

export function TicketsImport({ eventId, tiers }: { eventId: string; tiers: { id: string; name: string }[] }) {
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<BuyerRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [issuing, setIssuing] = useState(false);
  const [sending, setSending] = useState(false);

  function onParse() {
    const { rows, errors } = parseBuyerList(raw);
    setRows(rows); setErrors(errors);
  }

  async function onIssue() {
    setIssuing(true); setStatus("Émission…");
    const res = await fetch("/api/tickets/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId, rows }),
    });
    const data = await res.json();
    setStatus(`${data.issued ?? 0} billets émis${data.errors?.length ? ` · ${data.errors.length} erreurs` : ""}`);
    setIssuing(false);
  }

  async function onSend() {
    setSending(true); setStatus("Envoi des emails…");
    const res = await fetch("/api/tickets/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId }),
    });
    const data = await res.json();
    setStatus(`${data.sent ?? 0} emails envoyés${data.failed ? ` · ${data.failed} échecs` : ""}`);
    setSending(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-neutral-400 mb-1">Coller la liste (colonnes : email, firstName, lastName, tier, qty)</label>
        <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={10}
          className="w-full bg-neutral-900 text-white p-3 rounded font-mono text-sm"
          placeholder="email,firstName,lastName,tier,qty&#10;adam@test.com,Adam,Certhis,Early Bird,2" />
      </div>
      <div className="flex gap-2">
        <button onClick={onParse} className="px-4 py-2 bg-white text-black rounded">Prévisualiser</button>
        <button disabled={!rows.length || issuing} onClick={onIssue} className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-40">Émettre {rows.length} billets</button>
        <button disabled={sending} onClick={onSend} className="px-4 py-2 bg-violet-600 text-white rounded disabled:opacity-40">Envoyer les emails</button>
      </div>
      {errors.length > 0 && <div className="text-sm text-red-400">{errors.map((e,i)=><div key={i}>{e}</div>)}</div>}
      {status && <div className="text-sm text-emerald-400">{status}</div>}
      {rows.length > 0 && (
        <table className="w-full text-sm border border-neutral-800">
          <thead className="bg-neutral-900"><tr><th className="p-2 text-left">Email</th><th className="p-2 text-left">Nom</th><th className="p-2 text-left">Tier</th><th className="p-2 text-right">Qty</th></tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-t border-neutral-800">
                <td className="p-2">{r.email}</td><td className="p-2">{r.firstName} {r.lastName}</td>
                <td className="p-2">{r.tier}</td><td className="p-2 text-right">{r.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="text-xs text-neutral-500">Tiers disponibles : {tiers.map(t=>t.name).join(", ")}</div>
    </div>
  );
}
```

- [ ] **Step 2: Page dashboard (server component)**

Fichier `app/(dashboard)/dashboard/events/[id]/tickets/page.tsx` :
```tsx
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TicketsImport } from "@/components/dashboard/TicketsImport";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect("/login");

  const sb = supabaseAdmin();
  const { data: orga } = await sb.from("organizers").select("role")
    .eq("user_id", user.id).eq("event_id", id).eq("role", "owner").maybeSingle();
  if (!orga) redirect("/dashboard");

  const { data: event } = await sb.from("events").select("*").eq("id", id).single();
  const { data: tiers } = await sb.from("ticket_tiers").select("id,name").eq("event_id", id).order("sort_order");

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">{event!.name}</h1>
      <p className="text-neutral-400 mb-6">Importer et envoyer les billets</p>
      <TicketsImport eventId={id} tiers={tiers ?? []} />
    </div>
  );
}
```

- [ ] **Step 3: Dev server + test manuel**

```bash
cd /Users/adam/getstage && npm run dev
```

Puis : login avec `orga@example.com`, aller sur `/dashboard/events/<id>/tickets`, coller :
```
email,firstName,lastName,tier,qty
adam@test.com,Adam,Certhis,Early Bird,2
```
→ preview → Émettre → vérifier 2 tickets créés dans Supabase.

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/dashboard/events/\[id\]/tickets components/dashboard/TicketsImport.tsx
git commit -m "feat(dashboard): tickets import + issue + send UI"
```

---

## Phase 6 — Page billet publique `/t/[token]`

### Task 6.1: Page billet

**Files:**
- Create: `app/t/[token]/page.tsx`
- Create: `components/ticket/TicketCard.tsx`

- [ ] **Step 1: TicketCard component**

```tsx
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  firstName: string; lastName: string;
  eventName: string; eventDate: string;
  venueName: string; venueAddress: string; venueCity: string;
  tierName: string; shortCode: string;
  qrDataUrl: string; status: string;
  coverImageUrl?: string;
}

export function TicketCard(p: Props) {
  const used = p.status === "checked_in";
  return (
    <div className="max-w-md mx-auto bg-neutral-950 text-white rounded-2xl overflow-hidden shadow-2xl">
      {p.coverImageUrl && (
        <img src={p.coverImageUrl} alt="" className="w-full h-44 object-cover" />
      )}
      <div className="p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-400">Billet</div>
          <div className="text-2xl font-bold">{p.eventName}</div>
        </div>
        <div className="text-sm text-neutral-300">{p.eventDate}</div>
        <div className="text-sm text-neutral-400">{p.venueName} · {p.venueAddress}, {p.venueCity}</div>

        <div className="border-t border-dashed border-neutral-700 pt-4 grid grid-cols-2 gap-2 text-sm">
          <div><div className="text-neutral-500 text-xs">Porteur</div><div>{p.firstName} {p.lastName}</div></div>
          <div><div className="text-neutral-500 text-xs">Catégorie</div><div>{p.tierName}</div></div>
        </div>

        <div className={`relative mx-auto p-3 rounded-xl ${used ? "bg-neutral-900 opacity-40 grayscale" : "bg-white"}`} style={{ maxWidth: 260 }}>
          <img src={p.qrDataUrl} alt="QR" className="w-full" />
          {used && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-3xl rotate-[-20deg]">UTILISÉ</div>}
        </div>

        <div className="font-mono text-xs text-center text-neutral-500">{p.shortCode}</div>

        <div className="text-[10px] text-center text-neutral-600 pt-2">
          Billet nominatif · pièce d'identité demandée · GetStage by SNAPSS
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Page /t/[token]**

```tsx
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { generateQrDataUrl } from "@/lib/qr";
import { TicketCard } from "@/components/ticket/TicketCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("get_ticket_by_token", { p_token: token });
  if (error || !data || data.length === 0) notFound();

  const t = data[0];
  const qr = await generateQrDataUrl(token);
  const eventDate = format(new Date(t.event_starts_at), "EEEE d MMMM yyyy · HH'h'mm", { locale: fr });

  return (
    <main className="min-h-screen bg-black py-8 px-4">
      <TicketCard
        firstName={t.buyer_first_name}
        lastName={t.buyer_last_name}
        eventName={t.event_name}
        eventDate={eventDate}
        venueName={t.venue_name}
        venueAddress={t.venue_address}
        venueCity={t.venue_city}
        tierName={t.tier_name}
        shortCode={t.short_code}
        qrDataUrl={qr}
        status={t.status}
        coverImageUrl={t.cover_image_url}
      />
    </main>
  );
}
```

- [ ] **Step 3: Test manuel**

Copier un token depuis Supabase (`SELECT token FROM tickets LIMIT 1`), ouvrir `http://localhost:3000/t/<token>` → vérifier affichage complet avec QR.

- [ ] **Step 4: Commit**

```bash
git add app/t components/ticket
git commit -m "feat: public ticket page /t/[token] with QR"
```

---

## Phase 7 — Event privé (filtrage public)

### Task 7.1: Filtrer home, search, event detail

**Files:**
- Modify: `components/home/demo-home.tsx` (uniquement si queries Supabase présentes)
- Modify: `app/search/page.tsx`
- Modify: `app/event/[slug]/page.tsx`

- [ ] **Step 1: Grepper les usages d'events**

```bash
cd /Users/adam/getstage && grep -rn "from(\"events\"" app components lib
```

(Actuellement les events sont mocks — tant qu'on n'a pas basculé ces pages sur Supabase, RLS fait déjà le job pour les futurs devs. Action minimum : ajouter le filtrage dans la seule route qui query events côté public.)

- [ ] **Step 2: Modifier `app/event/[slug]/page.tsx`**

Remplacer la logique de chargement par :
```tsx
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("visibility", "public")
    .maybeSingle();
  if (!data) notFound();
  // … reste du rendu existant
}
```

Si la page actuelle utilise les mocks, laisser le rendu mocks intact (c'est pour la home publique). Ajouter juste le `notFound()` si la slug correspond à un event privé en DB (cas edge).

- [ ] **Step 3: Idem search/home** — si une vraie query Supabase existe, ajouter `.eq("visibility", "public")`. Sinon no-op (mocks).

- [ ] **Step 4: Ajouter meta noindex sur `/t/[token]`**

Modifier `app/t/[token]/page.tsx` :
```tsx
export const metadata = { robots: { index: false, follow: false } };
```

- [ ] **Step 5: Test manuel**

Créer un event privé via seed (déjà fait, visibility='private'). Tenter `http://localhost:3000/event/release-party-2026-04-22` → 404 attendu. Home et search ne doivent pas le lister.

- [ ] **Step 6: Commit**

```bash
git add app/event app/t
git commit -m "feat: enforce private events invisibility on public routes + noindex on ticket pages"
```

---

## Phase 8 — Scanner PWA (offline-first)

### Task 8.1: Middleware update + login scanner

**Files:**
- Modify: `middleware.ts`
- Create: `app/scan/login/page.tsx`
- Create: `app/scan/layout.tsx`

- [ ] **Step 1: Étendre le middleware**

Ouvrir `middleware.ts` et ajouter la logique :
```ts
// après le check dashboard existant :
if (request.nextUrl.pathname.startsWith("/scan") && !request.nextUrl.pathname.startsWith("/scan/login")) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/scan/login";
    return NextResponse.redirect(url);
  }
}
```

- [ ] **Step 2: Layout scan**

```tsx
export const metadata = {
  title: "GetStage Scanner",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
```

- [ ] **Step 3: Login scanner (server action)**

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const sb = await createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return;
    redirect("/scan");
  }
  return (
    <form action={login} className="min-h-screen flex flex-col justify-center max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Scanner GetStage</h1>
      <input name="email" type="email" placeholder="Email" required className="w-full p-3 bg-neutral-900 rounded" />
      <input name="password" type="password" placeholder="Mot de passe" required className="w-full p-3 bg-neutral-900 rounded" />
      <button className="w-full p-3 bg-gradient-to-r from-red-500 to-violet-500 rounded font-semibold">Se connecter</button>
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add middleware.ts app/scan
git commit -m "feat(scanner): add login page + middleware protection for /scan"
```

### Task 8.2: Bootstrap endpoint + IndexedDB

**Files:**
- Create: `app/api/scanner/bootstrap/route.ts`
- Create: `lib/scanner/db.ts`
- Create: `lib/scanner/sync.ts`
- Create: `types/scanner.ts`

- [ ] **Step 1: Types**

```ts
export interface ScannerTicket {
  id: string; token: string; short_code: string;
  first_name: string; last_name: string; tier_name: string;
  status: "issued" | "sent" | "checked_in" | "void";
  local_checked_in_at?: string;
}

export interface QueueItem {
  id?: number; ticket_id: string | null; token: string;
  device_id: string; scanned_at: string;
  result: "ok" | "duplicate" | "invalid" | "void";
  retries: number;
}

export interface ScannerEvent { id: string; name: string; starts_at: string; venue_name: string; capacity: number; }
```

- [ ] **Step 2: Dexie DB**

```ts
import Dexie, { Table } from "dexie";
import type { ScannerTicket, QueueItem, ScannerEvent } from "@/types/scanner";

export class ScannerDB extends Dexie {
  tickets!: Table<ScannerTicket, string>;
  queue!: Table<QueueItem, number>;
  meta!: Table<{ key: string; value: any }, string>;

  constructor() {
    super("getstage-scanner");
    this.version(1).stores({
      tickets: "token, id, status",
      queue: "++id, ticket_id, result",
      meta: "key",
    });
  }
}

export const db = new ScannerDB();

export async function setEvent(e: ScannerEvent) { await db.meta.put({ key: "event", value: e }); }
export async function getEvent(): Promise<ScannerEvent | undefined> {
  return (await db.meta.get("event"))?.value;
}
export async function setDeviceId(id: string) { await db.meta.put({ key: "device_id", value: id }); }
export async function getDeviceId(): Promise<string> {
  const m = await db.meta.get("device_id");
  if (m) return m.value;
  const id = crypto.randomUUID();
  await setDeviceId(id);
  return id;
}
```

- [ ] **Step 3: Bootstrap API**

```ts
import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();
  const { data: orga } = await sb
    .from("organizers").select("event_id, role")
    .eq("user_id", user.id).in("role", ["scanner", "owner"]).maybeSingle();
  if (!orga) return NextResponse.json({ error: "no_event" }, { status: 403 });

  const { data: event } = await sb.from("events").select("id,name,starts_at,venue_name,capacity").eq("id", orga.event_id).single();
  const { data: tickets } = await sb
    .from("tickets")
    .select("id, token, short_code, buyer_first_name, buyer_last_name, status, ticket_tiers(name)")
    .eq("event_id", orga.event_id)
    .in("status", ["sent", "issued", "checked_in"]);

  const flat = (tickets ?? []).map(t => ({
    id: t.id, token: t.token, short_code: t.short_code,
    first_name: t.buyer_first_name, last_name: t.buyer_last_name,
    tier_name: (t as any).ticket_tiers.name, status: t.status,
  }));

  return NextResponse.json({ event, tickets: flat });
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/scanner lib/scanner types/scanner.ts
git commit -m "feat(scanner): bootstrap endpoint + IndexedDB schema"
```

### Task 8.3: Check-in API

**Files:**
- Create: `app/api/checkin/route.ts`

- [ ] **Step 1: Implémenter**

```ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { token, device_id, scanned_at } = await req.json();

  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();
  const { data: orga } = await sb
    .from("organizers").select("event_id, role")
    .eq("user_id", user.id).in("role", ["scanner", "owner"]).maybeSingle();
  if (!orga) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: ticket } = await sb
    .from("tickets")
    .select("id, status, event_id")
    .eq("token", token)
    .maybeSingle();

  let result: "ok" | "duplicate" | "invalid" | "void" = "ok";
  let ticket_id: string | null = null;

  if (!ticket || ticket.event_id !== orga.event_id) {
    result = "invalid";
  } else {
    ticket_id = ticket.id;
    if (ticket.status === "void") result = "void";
    else if (ticket.status === "checked_in") result = "duplicate";
  }

  const { error: insertErr } = await sb.from("check_ins").insert({
    ticket_id, event_id: orga.event_id, scanned_by: user.id, device_id,
    scanned_at: scanned_at ?? new Date().toISOString(), result,
    attempted_token: ticket_id ? null : token,
  });

  // Unique index viole si un autre device a déjà fait "ok" en concurrent
  if (insertErr && insertErr.message.includes("duplicate key")) {
    return NextResponse.json({ result: "duplicate", ticket_id });
  }
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  if (result === "ok" && ticket_id) {
    await sb.from("tickets").update({ status: "checked_in", checked_in_at: new Date().toISOString() }).eq("id", ticket_id);
  }

  return NextResponse.json({ result, ticket_id });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/checkin
git commit -m "feat(api): POST /api/checkin with dedup + race-safe"
```

### Task 8.4: Sync queue

**Files:**
- Create: `lib/scanner/sync.ts`

- [ ] **Step 1: Implémenter**

```ts
import { db } from "./db";
import type { QueueItem } from "@/types/scanner";

let flushing = false;

export async function enqueue(item: Omit<QueueItem, "id" | "retries">) {
  await db.queue.add({ ...item, retries: 0 });
  flush();
}

export async function flush() {
  if (flushing || !navigator.onLine) return;
  flushing = true;
  try {
    const pending = await db.queue.toArray();
    for (const item of pending) {
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: item.token, device_id: item.device_id, scanned_at: item.scanned_at }),
        });
        if (!res.ok && res.status >= 500) throw new Error("server error");
        const data = await res.json();
        // Si le serveur dit "duplicate" alors qu'on pensait "ok" → on corrige localement
        if (data.result === "duplicate" && item.result === "ok" && item.ticket_id) {
          const t = await db.tickets.get(item.token);
          if (t) await db.tickets.update(item.token, { status: "checked_in" });
        }
        await db.queue.delete(item.id!);
      } catch {
        await db.queue.update(item.id!, { retries: (item.retries || 0) + 1 });
        if ((item.retries || 0) > 5) await db.queue.delete(item.id!); // abandon
        break;
      }
    }
  } finally {
    flushing = false;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => flush());
  setInterval(() => flush(), 10000);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/scanner/sync.ts
git commit -m "feat(scanner): sync queue with retry + online listener"
```

### Task 8.5: Scanner UI (webcam + compteur live)

**Files:**
- Create: `app/scan/page.tsx`
- Create: `components/scanner/ScannerView.tsx`
- Create: `components/scanner/LiveCounter.tsx`
- Create: `components/scanner/ScanFeedback.tsx`

- [ ] **Step 1: LiveCounter**

```tsx
"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/scanner/db";

export function LiveCounter({ capacity, eventName }: { capacity: number; eventName: string }) {
  const tickets = useLiveQuery(() => db.tickets.toArray(), []);
  const scanned = (tickets ?? []).filter(t => t.status === "checked_in").length;
  const pct = capacity > 0 ? Math.round((scanned / capacity) * 100) : 0;
  const color = pct < 30 ? "bg-red-500" : pct < 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="sticky top-0 bg-black/90 backdrop-blur p-4 border-b border-neutral-800 z-10">
      <div className="text-xs text-neutral-500">{eventName}</div>
      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-black tabular-nums">{scanned}</div>
        <div className="text-xl text-neutral-500">/ {capacity}</div>
        <div className="ml-auto text-sm text-neutral-400">{pct}%</div>
      </div>
      <div className="w-full h-1.5 bg-neutral-900 rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

(Requiert `dexie-react-hooks` — `npm install dexie-react-hooks`.)

- [ ] **Step 2: ScanFeedback**

```tsx
"use client";
export function ScanFeedback({ state }: { state: { kind: "idle" } | { kind: "ok"; name: string; tier: string } | { kind: "duplicate"; name: string } | { kind: "invalid" } }) {
  if (state.kind === "idle") return null;
  const color = state.kind === "ok" ? "bg-emerald-500" : state.kind === "duplicate" ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={`${color} text-black p-6 text-center`}>
      {state.kind === "ok" && <><div className="text-2xl font-black">BIENVENUE</div><div className="text-xl">{state.name}</div><div className="text-sm opacity-70">{state.tier}</div></>}
      {state.kind === "duplicate" && <><div className="text-2xl font-black">DÉJÀ UTILISÉ</div><div>{state.name}</div></>}
      {state.kind === "invalid" && <div className="text-2xl font-black">INVALIDE</div>}
    </div>
  );
}
```

- [ ] **Step 3: ScannerView (webcam + logique)**

```tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { db, getDeviceId } from "@/lib/scanner/db";
import { enqueue, flush } from "@/lib/scanner/sync";
import { ScanFeedback } from "./ScanFeedback";

type FB = { kind: "idle" } | { kind: "ok"; name: string; tier: string } | { kind: "duplicate"; name: string } | { kind: "invalid" };

export function ScannerView() {
  const [fb, setFb] = useState<FB>({ kind: "idle" });
  const busy = useRef(false);

  useEffect(() => {
    const el = document.getElementById("qr-box");
    if (!el) return;
    const scanner = new Html5Qrcode("qr-box", { verbose: false });
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 280 },
      async (decoded) => {
        if (busy.current) return;
        busy.current = true;
        const token = decoded.trim();
        const local = await db.tickets.get(token);
        const deviceId = await getDeviceId();
        const now = new Date().toISOString();

        if (!local) {
          setFb({ kind: "invalid" });
          await enqueue({ ticket_id: null, token, device_id: deviceId, scanned_at: now, result: "invalid" });
        } else if (local.status === "checked_in") {
          setFb({ kind: "duplicate", name: `${local.first_name} ${local.last_name}` });
          await enqueue({ ticket_id: local.id, token, device_id: deviceId, scanned_at: now, result: "duplicate" });
        } else {
          setFb({ kind: "ok", name: `${local.first_name} ${local.last_name}`, tier: local.tier_name });
          await db.tickets.update(token, { status: "checked_in", local_checked_in_at: now });
          await enqueue({ ticket_id: local.id, token, device_id: deviceId, scanned_at: now, result: "ok" });
          try { navigator.vibrate?.(100); } catch {}
        }
        setTimeout(() => { setFb({ kind: "idle" }); busy.current = false; flush(); }, 1500);
      },
      () => {}
    );
    return () => { scanner.stop().catch(()=>{}); scanner.clear(); };
  }, []);

  return (
    <div>
      <div id="qr-box" className="aspect-square bg-black" />
      <ScanFeedback state={fb} />
    </div>
  );
}
```

- [ ] **Step 4: Page /scan**

```tsx
"use client";
import { useEffect, useState } from "react";
import { db, setEvent, getEvent } from "@/lib/scanner/db";
import { LiveCounter } from "@/components/scanner/LiveCounter";
import { ScannerView } from "@/components/scanner/ScannerView";
import type { ScannerEvent } from "@/types/scanner";

export default function ScanPage() {
  const [event, setEv] = useState<ScannerEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const cached = await getEvent();
      if (cached) setEv(cached);
      if (navigator.onLine) {
        const res = await fetch("/api/scanner/bootstrap");
        if (res.ok) {
          const data = await res.json();
          await setEvent(data.event);
          await db.tickets.clear();
          await db.tickets.bulkAdd(data.tickets);
          setEv(data.event);
        }
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!event) return <div className="p-6">Aucun event assigné.</div>;

  return (
    <div>
      <LiveCounter capacity={event.capacity} eventName={event.name} />
      <ScannerView />
    </div>
  );
}
```

- [ ] **Step 5: Installer `dexie-react-hooks` (oublié en Phase 0)**

```bash
cd /Users/adam/getstage && npm install dexie-react-hooks
```

- [ ] **Step 6: Test manuel**

Se connecter avec `scan1@example.com`, ouvrir `/scan` sur un tel (ou via localhost + https ngrok). Scanner un QR émis. Couper le wifi, scanner un autre. Rallumer, vérifier sync.

- [ ] **Step 7: Commit**

```bash
git add app/scan components/scanner package.json package-lock.json
git commit -m "feat(scanner): webcam scanner + live counter + offline sync queue"
```

---

## Phase 9 — Dashboard stats

### Task 9.1: Stats API

**Files:**
- Create: `app/api/events/[id]/stats/route.ts`

- [ ] **Step 1: Implémenter**

```ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();
  const { data: orga } = await sb.from("organizers").select("role")
    .eq("user_id", user.id).eq("event_id", id).eq("role", "owner").maybeSingle();
  if (!orga) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: event } = await sb.from("events").select("capacity, starts_at").eq("id", id).single();
  const { data: tickets } = await sb.from("tickets").select("id, status, tier_id, ticket_tiers(name, price_cents)").eq("event_id", id);
  const { data: checkIns } = await sb.from("check_ins").select("result, scanned_at, ticket_id, tickets(buyer_first_name, buyer_last_name, ticket_tiers(name))").eq("event_id", id).order("scanned_at", { ascending: false });

  const issued = tickets!.length;
  const sent = tickets!.filter(t => t.status === "sent" || t.status === "checked_in").length;
  const checkedIn = tickets!.filter(t => t.status === "checked_in").length;
  const invalidAttempts = checkIns!.filter(c => c.result === "invalid").length;
  const revenueCents = tickets!.reduce((s, t: any) => s + (t.ticket_tiers?.price_cents ?? 0), 0);

  const byTierMap = new Map<string, any>();
  for (const t of tickets as any[]) {
    const k = t.tier_id;
    const e = byTierMap.get(k) ?? { tierId: k, tierName: t.ticket_tiers.name, issued: 0, checkedIn: 0, revenueCents: 0 };
    e.issued++;
    if (t.status === "checked_in") e.checkedIn++;
    e.revenueCents += t.ticket_tiers.price_cents;
    byTierMap.set(k, e);
  }

  // Arrivals timeline — 5-min buckets
  const arrivals: { t: string; count: number }[] = [];
  const buckets = new Map<string, number>();
  for (const c of checkIns as any[]) {
    if (c.result !== "ok") continue;
    const d = new Date(c.scanned_at);
    d.setSeconds(0, 0);
    d.setMinutes(Math.floor(d.getMinutes() / 5) * 5);
    const key = d.toISOString();
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  for (const [t, count] of [...buckets].sort(([a], [b]) => a.localeCompare(b))) arrivals.push({ t, count });

  const recentScans = (checkIns as any[])
    .filter(c => c.result === "ok" && c.tickets)
    .slice(0, 20)
    .map(c => ({
      firstName: c.tickets.buyer_first_name,
      lastName: c.tickets.buyer_last_name,
      tierName: c.tickets.ticket_tiers.name,
      scannedAt: c.scanned_at,
    }));

  return NextResponse.json({
    issued, sent, checkedIn, invalidAttempts, revenueCents,
    capacity: event!.capacity,
    byTier: [...byTierMap.values()],
    arrivalsTimeline: arrivals,
    recentScans,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/events
git commit -m "feat(api): GET /api/events/[id]/stats"
```

### Task 9.2: Dashboard UI

**Files:**
- Create: `components/dashboard/StatsCards.tsx`
- Create: `components/dashboard/ArrivalsChart.tsx`
- Create: `components/dashboard/TierDonut.tsx`
- Create: `components/dashboard/RecentScans.tsx`
- Create: `app/(dashboard)/dashboard/events/[id]/page.tsx`

- [ ] **Step 1: StatsCards**

```tsx
"use client";
export function StatsCards({ data }: { data: any }) {
  const cards = [
    { label: "Billets émis", value: data.issued },
    { label: "Emails envoyés", value: data.sent },
    { label: "Entrées scannées", value: data.checkedIn, accent: true },
    { label: "Taux d'entrée", value: data.issued ? `${Math.round(data.checkedIn / data.issued * 100)}%` : "—" },
    { label: "Chiffre d'affaires", value: `${(data.revenueCents / 100).toFixed(2)} €` },
    { label: "Capacité restante", value: Math.max(data.capacity - data.issued, 0) },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cards.map(c => (
        <div key={c.label} className={`p-4 rounded-xl ${c.accent ? "bg-gradient-to-br from-red-500/20 to-violet-500/20 border border-violet-500/40" : "bg-neutral-900"}`}>
          <div className="text-xs text-neutral-400">{c.label}</div>
          <div className="text-2xl font-bold mt-1 tabular-nums">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: ArrivalsChart**

```tsx
"use client";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export function ArrivalsChart({ data }: { data: { t: string; count: number }[] }) {
  const cum: { t: string; total: number }[] = [];
  let acc = 0;
  for (const p of data) { acc += p.count; cum.push({ t: p.t, total: acc }); }
  return (
    <div className="bg-neutral-900 rounded-xl p-4 h-64">
      <div className="text-sm text-neutral-400 mb-2">Arrivées cumulées</div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={cum}>
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} stroke="#525252" fontSize={10} />
          <YAxis stroke="#525252" fontSize={10} />
          <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a" }} />
          <Area type="monotone" dataKey="total" stroke="#EF4444" fill="url(#g)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: TierDonut**

```tsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#EF4444", "#8B5CF6", "#10B981", "#F59E0B", "#0EA5E9"];

export function TierDonut({ byTier }: { byTier: { tierName: string; checkedIn: number; issued: number }[] }) {
  const data = byTier.map(t => ({ name: t.tierName, value: t.checkedIn, total: t.issued }));
  return (
    <div className="bg-neutral-900 rounded-xl p-4 h-64">
      <div className="text-sm text-neutral-400 mb-2">Entrées par catégorie</div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a" }} formatter={(v: any, _n, p: any) => [`${v} / ${p.payload.total}`, p.payload.name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: RecentScans**

```tsx
"use client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function RecentScans({ scans }: { scans: { firstName: string; lastName: string; tierName: string; scannedAt: string }[] }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-4">
      <div className="text-sm text-neutral-400 mb-3">Derniers scans</div>
      <div className="divide-y divide-neutral-800 max-h-96 overflow-auto">
        {scans.length === 0 && <div className="text-sm text-neutral-600 py-6 text-center">Aucun scan pour l'instant</div>}
        {scans.map((s, i) => (
          <div key={i} className="py-2 flex justify-between text-sm">
            <div>
              <div className="font-medium">{s.firstName} {s.lastName}</div>
              <div className="text-xs text-neutral-500">{s.tierName}</div>
            </div>
            <div className="text-xs text-neutral-500">il y a {formatDistanceToNow(new Date(s.scannedAt), { locale: fr })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Page dashboard**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ArrivalsChart } from "@/components/dashboard/ArrivalsChart";
import { TierDonut } from "@/components/dashboard/TierDonut";
import { RecentScans } from "@/components/dashboard/RecentScans";

export default function DashboardEventPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let t: any;
    async function tick() {
      if (document.visibilityState === "visible") {
        const res = await fetch(`/api/events/${id}/stats`);
        if (res.ok) setData(await res.json());
      }
      t = setTimeout(tick, live ? 3000 : 10000);
    }
    tick();
    return () => clearTimeout(t);
  }, [id, live]);

  if (!data) return <div className="p-6 text-white">Chargement…</div>;

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={live} onChange={e => setLive(e.target.checked)} />
          Mode live (3s)
        </label>
      </div>
      <StatsCards data={data} />
      <div className="grid md:grid-cols-2 gap-4">
        <ArrivalsChart data={data.arrivalsTimeline} />
        <TierDonut byTier={data.byTier} />
      </div>
      <RecentScans scans={data.recentScans} />
      <div className="flex gap-2">
        <a href={`/dashboard/events/${id}/tickets`} className="px-4 py-2 bg-white text-black rounded">Gérer les billets</a>
        <a href={`/dashboard/events/${id}/settings`} className="px-4 py-2 bg-neutral-900 rounded">Paramètres email</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/dashboard app/\(dashboard\)/dashboard/events/\[id\]/page.tsx
git commit -m "feat(dashboard): stats page with KPIs, arrivals chart, tier donut, recent scans"
```

---

## Phase 10 — Email settings (BYOD)

### Task 10.1: Settings API (GET/PUT + test)

**Files:**
- Create: `app/api/events/[id]/email-settings/route.ts`
- Create: `app/api/events/[id]/email-settings/test/route.ts`

- [ ] **Step 1: GET/PUT settings**

```ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/crypto";

export const runtime = "nodejs";

async function requireOwner(eventId: string) {
  const user = (await (await createClient()).auth.getUser()).data.user;
  if (!user) return null;
  const sb = supabaseAdmin();
  const { data } = await sb.from("organizers").select("role")
    .eq("user_id", user.id).eq("event_id", eventId).eq("role", "owner").maybeSingle();
  return data ? { user, sb } : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOwner(id);
  if (!ctx) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { data } = await ctx.sb.from("event_email_settings").select("*").eq("event_id", id).maybeSingle();
  if (!data) return NextResponse.json({ provider: "getstage_default" });
  return NextResponse.json({
    provider: data.provider,
    from_email: data.from_email,
    from_name: data.from_name,
    reply_to: data.reply_to,
    smtp_host: data.smtp_host, smtp_port: data.smtp_port, smtp_secure: data.smtp_secure, smtp_user: data.smtp_user,
    has_resend_key: !!data.resend_api_key_encrypted,
    has_smtp_password: !!data.smtp_password_encrypted,
    last_test_at: data.last_test_at, last_test_ok: data.last_test_ok, last_test_error: data.last_test_error,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOwner(id);
  if (!ctx) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();

  const payload: any = {
    event_id: id,
    provider: body.provider,
    from_email: body.from_email ?? null,
    from_name: body.from_name ?? null,
    reply_to: body.reply_to ?? null,
    smtp_host: body.smtp_host ?? null,
    smtp_port: body.smtp_port ?? null,
    smtp_secure: body.smtp_secure ?? null,
    smtp_user: body.smtp_user ?? null,
    updated_at: new Date().toISOString(),
  };
  if (body.resend_api_key) payload.resend_api_key_encrypted = encrypt(body.resend_api_key);
  if (body.smtp_password) payload.smtp_password_encrypted = encrypt(body.smtp_password);

  const { error } = await ctx.sb.from("event_email_settings").upsert(payload);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Test email**

```ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { makeResendTransport } from "@/lib/email/resend";
import { makeSmtpTransport } from "@/lib/email/smtp";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await (await createClient()).auth.getUser()).data.user;
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const { data: orga } = await sb.from("organizers").select("role").eq("user_id", user.id).eq("event_id", id).eq("role", "owner").maybeSingle();
  if (!orga) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { provider, config, testRecipient } = await req.json();

  let transport;
  try {
    if (provider === "resend_custom") {
      transport = makeResendTransport({
        apiKey: config.resend_api_key,
        fromEmail: config.from_email, fromName: config.from_name, replyTo: config.reply_to,
      });
    } else if (provider === "smtp") {
      transport = makeSmtpTransport({
        host: config.smtp_host, port: config.smtp_port, secure: !!config.smtp_secure,
        user: config.smtp_user, password: config.smtp_password,
        fromEmail: config.from_email, fromName: config.from_name, replyTo: config.reply_to,
      });
    } else {
      return NextResponse.json({ ok: false, error: "provider par défaut — rien à tester" });
    }

    const result = await transport.test(testRecipient);

    await sb.from("event_email_settings").upsert({
      event_id: id,
      last_test_at: new Date().toISOString(),
      last_test_ok: result.ok,
      last_test_error: result.error ?? null,
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/events/\[id\]/email-settings
git commit -m "feat(api): event email settings (GET/PUT) + test endpoint"
```

### Task 10.2: Settings UI

**Files:**
- Create: `components/dashboard/EmailSettingsForm.tsx`
- Create: `app/(dashboard)/dashboard/events/[id]/settings/page.tsx`

- [ ] **Step 1: Form**

```tsx
"use client";
import { useEffect, useState } from "react";

export function EmailSettingsForm({ eventId }: { eventId: string }) {
  const [s, setS] = useState<any>({ provider: "getstage_default" });
  const [testTo, setTestTo] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}/email-settings`).then(r => r.json()).then(setS);
  }, [eventId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/events/${eventId}/email-settings`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
    });
    setMsg(res.ok ? "✓ Enregistré" : "Erreur");
  }

  async function onTest() {
    const res = await fetch(`/api/events/${eventId}/email-settings/test`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: s.provider, config: s, testRecipient: testTo }),
    });
    const data = await res.json();
    setMsg(data.ok ? "✓ Test envoyé" : `✗ ${data.error}`);
  }

  return (
    <form onSubmit={onSave} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm text-neutral-400 mb-1">Provider</label>
        <select value={s.provider} onChange={e => setS({ ...s, provider: e.target.value })} className="w-full p-2 bg-neutral-900 rounded">
          <option value="getstage_default">GetStage (par défaut)</option>
          <option value="resend_custom">Resend (mon compte / mon domaine)</option>
          <option value="smtp">SMTP personnalisé</option>
        </select>
      </div>

      {s.provider !== "getstage_default" && (
        <>
          <input placeholder="From email (ex: billets@client.com)" value={s.from_email ?? ""} onChange={e => setS({ ...s, from_email: e.target.value })} className="w-full p-2 bg-neutral-900 rounded" />
          <input placeholder="From name" value={s.from_name ?? ""} onChange={e => setS({ ...s, from_name: e.target.value })} className="w-full p-2 bg-neutral-900 rounded" />
          <input placeholder="Reply-to (optionnel)" value={s.reply_to ?? ""} onChange={e => setS({ ...s, reply_to: e.target.value })} className="w-full p-2 bg-neutral-900 rounded" />
        </>
      )}

      {s.provider === "resend_custom" && (
        <input placeholder={s.has_resend_key ? "API key (••••••••) — remplacer" : "Resend API key (re_...)"} onChange={e => setS({ ...s, resend_api_key: e.target.value })} className="w-full p-2 bg-neutral-900 rounded font-mono text-xs" />
      )}

      {s.provider === "smtp" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Host" value={s.smtp_host ?? ""} onChange={e => setS({ ...s, smtp_host: e.target.value })} className="col-span-2 p-2 bg-neutral-900 rounded" />
            <input placeholder="Port" type="number" value={s.smtp_port ?? ""} onChange={e => setS({ ...s, smtp_port: parseInt(e.target.value) })} className="p-2 bg-neutral-900 rounded" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!s.smtp_secure} onChange={e => setS({ ...s, smtp_secure: e.target.checked })} /> TLS (port 465) · sinon STARTTLS</label>
          <input placeholder="User" value={s.smtp_user ?? ""} onChange={e => setS({ ...s, smtp_user: e.target.value })} className="w-full p-2 bg-neutral-900 rounded" />
          <input placeholder={s.has_smtp_password ? "Password (••••••••) — remplacer" : "Password"} type="password" onChange={e => setS({ ...s, smtp_password: e.target.value })} className="w-full p-2 bg-neutral-900 rounded" />
        </>
      )}

      <div className="flex gap-2 pt-2 border-t border-neutral-800">
        <input placeholder="Email test" value={testTo} onChange={e => setTestTo(e.target.value)} className="flex-1 p-2 bg-neutral-900 rounded" />
        <button type="button" onClick={onTest} className="px-4 py-2 bg-neutral-800 rounded">Envoyer test</button>
        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-red-500 to-violet-500 rounded font-semibold">Enregistrer</button>
      </div>

      {msg && <div className="text-sm">{msg}</div>}
      {s.last_test_at && (
        <div className="text-xs text-neutral-500">Dernier test : {new Date(s.last_test_at).toLocaleString()} · {s.last_test_ok ? "✓ OK" : `✗ ${s.last_test_error}`}</div>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Page**

```tsx
import { EmailSettingsForm } from "@/components/dashboard/EmailSettingsForm";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Paramètres email</h1>
      <EmailSettingsForm eventId={id} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/EmailSettingsForm.tsx app/\(dashboard\)/dashboard/events/\[id\]/settings
git commit -m "feat(dashboard): email settings form (BYOD resend/smtp)"
```

---

## Phase 11 — Smoke test end-to-end

### Task 11.1: Run the full test plan from the spec

- [ ] **Step 1: Tout le flow heureux**

Suivre points 1 à 16 de la section "Testing plan (local)" du spec (`docs/superpowers/specs/2026-04-15-getstage-live-design.md`) :

1. Migration appliquée (Task 1.1 déjà fait)
2. `npm run seed:event` → event + 3 users OK
3. Login orga → `/dashboard/events/<id>/tickets`
4. Coller 3 lignes test, émettre → vérifier tickets en DB
5. Envoyer emails → vérifier réception
6. Ouvrir lien email → `/t/[token]` affiche
7. Login scanner → bootstrap
8. Wifi OFF + scan → UI verte, queue
9. Wifi ON → queue flush
10. Re-scan → orange "déjà utilisé"
11. Token bidon → rouge invalide
12. Event privé invisible sur `/`, `/search`, `/event/slug`
13. Dashboard stats : KPIs, courbe, donut, live scans
14. Settings SMTP Gmail → test vert → sauver → envoyer → email depuis adresse custom
15. Settings Resend custom → idem
16. Session scanner persistée

- [ ] **Step 2: Fixer les bugs découverts** (zone réservée — les bugs apparaitront)

- [ ] **Step 3: Commit final**

```bash
git add .
git commit -m "chore: smoke test fixes + polish"
```

---

## Après validation locale : déploiement

**À FAIRE UNIQUEMENT après validation explicite de l'utilisateur** (il a demandé "push rien").

### Task 12.1: Variables d'env Vercel

- [ ] Ajouter sur Vercel (via `vercel env add` ou dashboard) :
  - `SUPABASE_SERVICE_ROLE_KEY` (scope: production + preview)
  - `EMAIL_SECRETS_KEY` (scope: production + preview) — MÊME valeur que local, sinon secrets en DB illisibles
  - `RESEND_API_KEY` (scope: production + preview)
  - `NEXT_PUBLIC_APP_URL=https://www.getstage.io` (scope: production)

### Task 12.2: Push + deploy

- [ ] `git push origin main` (après confirmation utilisateur)
- [ ] Vérifier déploiement sur `https://www.getstage.io`
- [ ] Tester `/dashboard/events/<id>/tickets` en prod avec le compte orga
- [ ] Envoyer un ticket test à soi-même
- [ ] Tester le scanner sur mobile physique

---

## Self-Review

**Spec coverage :**
- ✅ Schema complet → Task 1.1
- ✅ RLS + RPC → Task 1.1
- ✅ Event privé invisible → Task 7.1
- ✅ Dashboard tickets (import + émission + envoi) → Task 5.1
- ✅ Dashboard stats → Task 9.1, 9.2
- ✅ Email settings BYOD → Task 10.1, 10.2
- ✅ Email template + QR + send → Task 2.3, 2.6, 4.2
- ✅ Page billet publique → Task 6.1
- ✅ Scanner offline-first + compteur live → Task 8.1 à 8.5
- ✅ Check-in API race-safe → Task 8.3
- ✅ Seed script → Task 3.1
- ✅ Smoke test plan → Task 11.1

**Placeholder scan :** OK (tout le code est présent, aucun "TODO" ni "TBD").

**Type consistency :** `ScannerTicket`, `QueueItem`, `ScannerEvent` cohérents entre `types/scanner.ts`, `lib/scanner/db.ts`, `lib/scanner/sync.ts`, composants. `BuyerRow` cohérent entre `lib/csv-parser.ts` et `TicketsImport.tsx`.

**Notes d'exécution :**
- Tout en **local only** jusqu'au go user pour Task 12
- **Dépendance manquante à installer après Phase 0** : `dexie-react-hooks` (ajouté en Task 8.5 step 5 mais à ne pas oublier)
- Les infos event réelles (nom client, date exacte, venue, tiers, prix) remplacent la fixture JSON quand user les fournit
- Resend API key : dev avec `onboarding@resend.dev` possible ; switch au domaine vérifié client quand prêt
