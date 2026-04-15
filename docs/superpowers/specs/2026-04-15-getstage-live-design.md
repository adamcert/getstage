# GetStage Live — Release Party MVP

**Date:** 2026-04-15
**Target delivery:** 2026-04-16 end of day (local testing)
**Production use:** emails sent 2026-04-17/18, event night 2026-04-22

## Context

Un premier client de GetStage organise une release party le mercredi 22 avril. Il a déjà vendu ses places en direct. On doit livrer une plateforme minimale qui lui permet :

1. D'importer sa liste d'acheteurs (email, nom, tier, qty)
2. D'émettre un ticket nominatif unique par place vendue
3. D'envoyer ces tickets par email aux acheteurs
4. De scanner les tickets à l'entrée avec un tel (mode offline-capable)

L'event reste **privé** : il ne doit pas apparaître sur le site public de GetStage, ni être trouvable via recherche, ni via URL directe `/event/[slug]`.

## Scope

### In

- Schéma DB Supabase (events, ticket_tiers, tickets, check_ins, organizers, event_email_settings)
- Event privé (`visibility = 'private'`) : invisible sur home, search, /event/[slug] → 404
- Dashboard orga `/dashboard/events/[id]/tickets` : import CSV/TSV, émission, envoi email
- Dashboard stats `/dashboard/events/[id]` : KPIs temps réel (émis, envoyés, scannés, taux entrée, CA, répartition par tier)
- Réglages email par event `/dashboard/events/[id]/settings` : choix sender (Resend par défaut **ou** custom domain Resend **ou** SMTP personnalisé)
- Email de billet via Resend ou SMTP custom, avec QR inline + lien `/t/[token]`
- Page billet publique `/t/[token]` : sans auth, mobile-first, reprise du mockup visuel déjà généré
- Scanner PWA `/scan` offline-first, avec auth, IndexedDB des tokens, sync queue, compteur live
- Script seed `scripts/seed-event.ts` pour créer l'event + comptes orga/scanner

### Out (explicitement coupé pour cette V1)

Paiement, Stripe, revente, transfert de ticket, Apple/Google Wallet, refund, analytics détaillées, emails de relance, i18n (FR uniquement), création d'event dans l'UI, multi-event par scanner, Webhooks.

## Data Model

### Tables

```sql
-- Events
CREATE TYPE event_visibility AS ENUM ('public', 'private');

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  venue_city TEXT NOT NULL,
  cover_image_url TEXT,
  capacity INT NOT NULL,
  visibility event_visibility NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_visibility ON events(visibility);
CREATE INDEX idx_events_slug ON events(slug) WHERE visibility = 'public';

-- Ticket tiers
CREATE TABLE ticket_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_cents INT NOT NULL,
  quantity_total INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_tiers_event ON ticket_tiers(event_id);

-- Tickets
CREATE TYPE ticket_status AS ENUM ('issued', 'sent', 'checked_in', 'void');

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES ticket_tiers(id),
  buyer_email TEXT NOT NULL,
  buyer_first_name TEXT NOT NULL,
  buyer_last_name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,            -- nanoid URL-safe, 24 chars
  short_code TEXT UNIQUE NOT NULL,       -- human-readable "TKT-XXXX-XXXX"
  status ticket_status NOT NULL DEFAULT 'issued',
  sent_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_token ON tickets(token);
CREATE INDEX idx_tickets_email ON tickets(buyer_email);

-- Check-ins
CREATE TYPE check_in_result AS ENUM ('ok', 'duplicate', 'invalid', 'void');

CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  scanned_by UUID REFERENCES auth.users(id),
  device_id TEXT,                        -- client-generated per device
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  result check_in_result NOT NULL,
  attempted_token TEXT                   -- kept when ticket_id is null (invalid scans)
);

CREATE INDEX idx_check_ins_event ON check_ins(event_id);
CREATE INDEX idx_check_ins_ticket ON check_ins(ticket_id);

-- Dedup: only one 'ok' check-in per ticket
CREATE UNIQUE INDEX idx_check_ins_ticket_ok
  ON check_ins(ticket_id)
  WHERE result = 'ok';

-- Email settings per event (BYOD: bring your own domain / SMTP)
CREATE TYPE email_provider AS ENUM ('getstage_default', 'resend_custom', 'smtp');

CREATE TABLE event_email_settings (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  provider email_provider NOT NULL DEFAULT 'getstage_default',

  -- Commun à tous les providers non-default
  from_email TEXT,                       -- ex: billets@client.com
  from_name TEXT,                        -- ex: "Release Party by Client"
  reply_to TEXT,

  -- Si provider = 'resend_custom' : on relaie via le compte Resend GetStage
  -- avec un domaine que le client a ajouté à son propre compte Resend
  -- et dont il nous file l'API key ; OU via son propre compte Resend.
  resend_api_key_encrypted TEXT,
  resend_domain_verified BOOLEAN NOT NULL DEFAULT false,

  -- Si provider = 'smtp' : nodemailer générique
  smtp_host TEXT,
  smtp_port INT,
  smtp_secure BOOLEAN,                   -- true = TLS 465, false = STARTTLS 587
  smtp_user TEXT,
  smtp_password_encrypted TEXT,

  last_test_at TIMESTAMPTZ,
  last_test_ok BOOLEAN,
  last_test_error TEXT,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organizers (links auth.users to an event with a role)
CREATE TYPE organizer_role AS ENUM ('owner', 'scanner');

CREATE TABLE organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role organizer_role NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

CREATE INDEX idx_organizers_user ON organizers(user_id);
CREATE INDEX idx_organizers_event ON organizers(event_id);
```

### RLS Policies

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

-- events : public peut lire uniquement les events publics
CREATE POLICY events_public_read ON events
  FOR SELECT TO anon, authenticated
  USING (visibility = 'public');

-- events : orga de l'event peut tout
CREATE POLICY events_organizer_all ON events
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organizers
    WHERE organizers.event_id = events.id
      AND organizers.user_id = auth.uid()
      AND organizers.role = 'owner'
  ));

-- ticket_tiers : orga de l'event peut tout, public lit si event public
CREATE POLICY tiers_public_read ON ticket_tiers
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = ticket_tiers.event_id
      AND events.visibility = 'public'
  ));

CREATE POLICY tiers_organizer_all ON ticket_tiers
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organizers o
    WHERE o.event_id = ticket_tiers.event_id
      AND o.user_id = auth.uid()
      AND o.role = 'owner'
  ));

-- tickets : jamais lisible par anon sauf via RPC par token (voir plus bas)
-- scanner (role=scanner) lit les tickets de son event
CREATE POLICY tickets_scanner_read ON tickets
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organizers o
    WHERE o.event_id = tickets.event_id
      AND o.user_id = auth.uid()
      AND o.role IN ('owner', 'scanner')
  ));

CREATE POLICY tickets_organizer_all ON tickets
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organizers o
    WHERE o.event_id = tickets.event_id
      AND o.user_id = auth.uid()
      AND o.role = 'owner'
  ));

-- check_ins : scanner/owner de l'event peut lire + insérer
CREATE POLICY checkins_staff_all ON check_ins
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organizers o
    WHERE o.event_id = check_ins.event_id
      AND o.user_id = auth.uid()
      AND o.role IN ('owner', 'scanner')
  ));

-- organizers : chacun lit ses propres lignes
CREATE POLICY organizers_self_read ON organizers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- email settings : owner only, et les secrets ne sortent jamais via les clients.
-- Toutes les lectures/écritures passent par server actions avec service_role.
ALTER TABLE event_email_settings ENABLE ROW LEVEL SECURITY;
-- Pas de policy permissive : par défaut tout est fermé.
-- Les server actions utilisent la service_role (bypass RLS) pour lire/écrire.

-- RPC pour page billet publique (contourne RLS avec SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_ticket_by_token(p_token TEXT)
RETURNS TABLE (
  ticket_id UUID,
  short_code TEXT,
  buyer_first_name TEXT,
  buyer_last_name TEXT,
  tier_name TEXT,
  event_name TEXT,
  event_starts_at TIMESTAMPTZ,
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  cover_image_url TEXT,
  status ticket_status
)
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.short_code, t.buyer_first_name, t.buyer_last_name,
         tt.name, e.name, e.starts_at, e.venue_name, e.venue_address,
         e.venue_city, e.cover_image_url, t.status
  FROM tickets t
  JOIN ticket_tiers tt ON tt.id = t.tier_id
  JOIN events e ON e.id = t.event_id
  WHERE t.token = p_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_ticket_by_token(TEXT) TO anon, authenticated;
```

## Architecture

### Routes

| Route | Type | Auth | Description |
|---|---|---|---|
| `/` | public | — | Home (filtrée `visibility=public` : event privé absent) |
| `/search` | public | — | Discover (idem) |
| `/event/[slug]` | public | — | 404 si event privé ou inexistant |
| `/t/[token]` | public | — | Billet : sert la page mockup avec données RPC |
| `/dashboard/events/[id]` | privé | owner | **Stats dashboard** : KPIs, courbes, répartition tiers, live scans |
| `/dashboard/events/[id]/tickets` | privé | owner | Import + émission + envoi |
| `/dashboard/events/[id]/settings` | privé | owner | **Nouveau** : email sender (default / Resend custom / SMTP) + test |
| `/scan/login` | privé | — | Login scanner |
| `/scan` | privé | scanner/owner | PWA scanner + compteur live |
| `/api/tickets/issue` | API | owner | Émet N tickets à partir de la liste parsée |
| `/api/tickets/send` | API | owner | Déclenche envoi email (provider selon settings) |
| `/api/checkin` | API | scanner/owner | Valide un token, crée un `check_ins` |
| `/api/events/[id]/stats` | API | owner | Snapshot stats (JSON) pour le dashboard |
| `/api/events/[id]/email-settings/test` | API | owner | Envoie un mail de test avec la config courante |

### Middleware

Étendu pour protéger `/scan` en plus de `/dashboard`. Les utilisateurs non authentifiés sur `/scan` sont redirigés vers `/scan/login` (pas vers `/login` global — UX différente, login dédié).

### Flow d'émission de tickets

```
Orga colle CSV dans textarea (dashboard/events/[id]/tickets)
  ↓
Parse côté client (papaparse) + preview dans table éditable
  ↓
POST /api/tickets/issue { event_id, rows: [{email, firstName, lastName, tier_id, qty}] }
  ↓
Server action (service_role) :
  - valide emails
  - vérifie capacité restante par tier
  - génère nanoid + short_code par ticket (1 ligne par qty)
  - insert bulk dans tickets (status='issued')
  - retourne summary {issued: N, errors: [...]}
  ↓
Orga clique "Envoyer emails" → POST /api/tickets/send { event_id }
  ↓
Server action :
  - lit event_email_settings (service_role, secrets déchiffrés en mémoire)
  - instancie le transport via getTransportForEvent(event_id) :
      provider='getstage_default' → Resend GetStage (from: billets@getstage.io)
      provider='resend_custom'    → Resend SDK avec l'API key du client
      provider='smtp'             → nodemailer.createTransport(host, port, auth)
  - select tickets where event_id=X AND status='issued'
  - pour chaque : render React Email + QR PNG base64
  - await transport.send(...)
  - update ticket set status='sent', sent_at=now()
  - renvoie summary {sent, failed, errors[]}
```

### Email provider abstraction (BYOD)

Fichier `lib/email/index.ts` — interface unique :

```ts
export interface EmailTransport {
  send(msg: SendArgs): Promise<{ id: string }>;
  test(to: string): Promise<{ ok: boolean; error?: string }>;
}

export async function getTransportForEvent(eventId: string): Promise<EmailTransport>;
```

Implémentations :
- `lib/email/resend.ts` — wrapper `Resend` SDK (default + resend_custom ne diffèrent que par l'API key)
- `lib/email/smtp.ts` — wrapper `nodemailer` générique (Postmark, SendGrid, Mailgun, Gmail app password, etc.)

Secrets :
- `resend_api_key_encrypted`, `smtp_password_encrypted` chiffrés via `crypto.createCipheriv('aes-256-gcm')` avec clé `EMAIL_SECRETS_KEY` (env Vercel, 32 bytes base64)
- Jamais renvoyés au client. L'UI settings affiche `••••••••` quand déjà configuré et un bouton "Remplacer" pour changer.
- Lecture/écriture uniquement via service_role côté server action.

### Flow "test email" (page settings)

```
Orga remplit le formulaire settings → clique "Envoyer un test"
  ↓
POST /api/events/[id]/email-settings/test { config, testRecipient }
  ↓
Server :
  - instancie le transport à partir de la config fournie (non persistée)
  - envoie un mail "GetStage — email de test" au testRecipient
  - persist last_test_at, last_test_ok, last_test_error dans event_email_settings
  ↓
UI : badge vert "✓ Test OK" ou rouge "✗ {message erreur}"
```

La sauvegarde définitive passe par un bouton "Enregistrer" séparé qui chiffre et persist les secrets.

### Flow scanner (offline-first)

```
Au login scanner :
  - Supabase auth sign-in
  - fetch /api/scanner/bootstrap → { event, tokens[] }
  - store dans IndexedDB (dexie)
    - db.event = { id, name, starts_at, venue_name }
    - db.tickets = [{ token, short_code, firstName, lastName, tierName, status }]
    - db.queue = []  (check-ins en attente de sync)

Écran scan :
  - html5-qrcode stream webcam
  - onScan(token) :
    - lookup db.tickets où token == scanned
      - absent → UI rouge "Invalide", log local avec result='invalid'
      - found status != 'sent'/'checked_in' → idem
      - found + local already checked_in → UI orange "Déjà utilisé"
      - found OK :
        - UI verte "Bienvenue {firstName}"
        - son + vibration
        - mark local checked_in_at = now()
        - enqueue { ticket_id, token, device_id, scanned_at, result:'ok' }
    - trigger flush queue

Sync queue :
  - si navigator.onLine : POST /api/checkin pour chaque item (sequential)
  - serveur insert dans check_ins :
    - si unique constraint viole → renvoie {duplicate:true}
    - sinon insert + update tickets.status='checked_in'
  - sur duplicate reçu : log local, UI orange à la prochaine consultation
  - retry exponentiel si offline, persiste dans IndexedDB

Compteur live (toujours visible en haut du scanner) :
  - gros chiffre "X / capacity" (ex: "127 / 500")
  - mini-progress bar colorée (rouge <30%, ambre 30-70%, vert 70-100%)
  - delta depuis dernier scan ("+1 il y a 3s")
  - % de check-in
  - valeur calculée 100% localement à partir d'IndexedDB (pas de latence réseau)
  - sync passive avec serveur au retour online pour corriger si un autre device a scanné

Écran "Liste check-ins" (temps réel) :
  - polling 5s si online, sinon lecture locale
  - affiche derniers scans (nom, heure, tier) en scroll infini
  - bouton "Tous scanner" / "Pas encore arrivés" pour filtrer
```

### Dashboard stats orga `/dashboard/events/[id]`

Page de pilotage temps réel pour l'orga pendant et après la soirée.

**KPIs en haut (cards) :**
| Card | Calcul |
|---|---|
| Billets émis | `COUNT(tickets WHERE event_id=X)` |
| Emails envoyés | `COUNT(tickets WHERE status IN ('sent','checked_in'))` |
| Entrées scannées | `COUNT(check_ins WHERE event_id=X AND result='ok')` |
| Taux d'entrée | `scannés / émis` |
| Chiffre d'affaires | `SUM(tier.price_cents)` des tickets émis |
| Capacité restante | `event.capacity - émis` |

**Visualisations :**
- **Courbe d'arrivées** : check-ins cumulés par tranche de 5 min depuis `event.starts_at - 1h`. Area chart. Montre le pic d'entrée.
- **Répartition par tier** : donut chart (Early Bird X%, Standard Y%, VIP Z%), émis vs scannés par tier.
- **Derniers scans** : liste live (nom, tier, heure) — top 20, auto-refresh.
- **Status émission** : barre horizontale segmentée (issued / sent / checked_in / void).

**Refresh :**
- Polling `GET /api/events/[id]/stats` toutes les 10s quand la page est visible.
- Tab background → pause le polling (Page Visibility API).
- Option "Mode live" qui passe le polling à 3s pour la porte.

**Endpoint `/api/events/[id]/stats` renvoie :**
```ts
{
  issued: number,
  sent: number,
  checkedIn: number,
  invalidAttempts: number,
  revenueCents: number,
  capacity: number,
  byTier: [{ tierId, tierName, issued, checkedIn, revenueCents }],
  arrivalsTimeline: [{ t: ISO, count: number }],  // buckets 5 min
  recentScans: [{ firstName, lastName, tierName, scannedAt }],  // top 20
}
```

Auth : owner only (vérif via table `organizers`).

### Génération des tokens

- **token** : `nanoid(24)` URL-safe — 144 bits d'entropie, collision négligeable. Stocké brut en DB (il est la clé d'accès, comme un password reset link). Protection : HTTPS obligatoire, URL non loggée côté serveur, rate limit sur `/t/[token]` et `/api/checkin`.
- **short_code** : `TKT-` + 4 hex + `-` + 4 hex (lisible humain pour support téléphone). Non-secret, peut apparaître dans emails clients en fallback.

### Email template (React Email)

Composant `emails/TicketEmail.tsx` :
- logo GetStage header
- "Bonjour {firstName}, ton billet pour {eventName} est confirmé."
- bloc date + venue
- QR inline (cid:attachment, généré avec `qrcode` en PNG 400x400)
- CTA bouton "Ouvrir mon billet" → `/t/{token}`
- short_code en mono en bas
- pied de page légal

## Testing plan (local)

1. Appliquer migrations Supabase (via `supabase` CLI ou SQL editor)
2. Run `scripts/seed-event.ts` avec JSON fixture → vérifier event + tiers + comptes créés
3. Login dashboard en tant qu'orga → route `/dashboard/events/[id]/tickets` charge
4. Coller 3 lignes test → preview → "Émettre" → vérifier 3 tickets en DB
5. "Envoyer emails" avec sender `onboarding@resend.dev` → vérifier réception (email test)
6. Cliquer lien dans email → page `/t/[token]` affiche le billet + QR
7. Login scanner (second compte) sur `/scan/login` → bootstrap IndexedDB
8. Couper le wifi, scanner le QR → UI verte, check-in en queue
9. Rallumer le wifi → queue flush, vérifier `check_ins` en DB
10. Re-scanner le même QR → UI orange "déjà utilisé"
11. Forger un token bidon → UI rouge "Invalide", log en DB avec `attempted_token`
12. Vérifier que l'event NE apparait PAS sur `/`, `/search`, et que `/event/[slug]` renvoie 404
13. Ouvrir `/dashboard/events/[id]` → vérifier les 6 KPIs, la courbe d'arrivée qui grimpe, le donut par tier, le flux "derniers scans" qui se rafraîchit
14. Aller sur `/dashboard/events/[id]/settings` :
    - passer provider à `smtp`, remplir creds Gmail (app password) + from_email perso
    - cliquer "Envoyer un test" → vérifier réception, badge vert
    - Enregistrer → vérifier `last_test_ok=true` en DB, password chiffré (pas lisible en clair)
    - retour sur `/tickets`, "Envoyer emails" → nouveau batch part depuis l'adresse custom
15. Tester provider `resend_custom` : coller API key Resend personnelle, domaine déjà vérifié côté client, envoyer un test → reception depuis ce domaine
16. Déconnecter un scanner, le rouvrir → session persistée (pas de re-login), IndexedDB rechargée

## Risks & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| DNS Resend pas propagé à temps | moyenne | moyen | Dev avec `onboarding@resend.dev`, switch domaine au moment T |
| 4G down au venue | moyenne | haut | Offline-first scanner, IndexedDB + queue |
| Ticket partagé entre 2 personnes | haute | moyen | Contrainte unique sur check-ins OK, premier scan gagne |
| Client mauvais format CSV | haute | faible | Parse souple (papaparse), preview éditable, validation emails |
| Emails en spam | moyenne | haut | SPF/DKIM Resend vérifiés (client), copy neutre |
| Token leak dans logs serveur | faible | haut | Ne jamais logger l'URL complète, seulement `ticket_id` ou short_code |
| Race condition double-scan rapproché | faible | moyen | Unique partial index sur `check_ins(ticket_id) WHERE result='ok'` |
| SMTP custom mal configuré → batch entier échoue | moyenne | haut | "Test email" obligatoire avant émission ; `last_test_ok` doit être true ; warning UI sinon |
| API key Resend client fuit | faible | haut | Chiffrement AES-256-GCM, jamais renvoyée au client, rotation facile via "Remplacer" dans UI |
| Dashboard polling surcharge serveur | faible | faible | Polling 10s par défaut, pause si onglet en background |

## Decisions encore ouvertes

- **Nombre de comptes scanner** : défaut **N comptes (un par porte/device)** via paramètre du script seed (`scannerCount: 2`). Traçabilité par `scanned_by`. Changeable en 1 ligne.
- **Sender email final** : dépend de la vérif domaine Resend côté client. Fallback `onboarding@resend.dev` documenté.

## Non-goals post-event

Après la release party, on pourra re-ouvrir ce scope pour : création d'event UI, paiement Stripe, multi-event scanner, Apple Wallet, revente, refund flow, onboarding self-service du domaine email directement via l'API Resend.

## Dépendances npm à ajouter

- `resend` — SDK officiel
- `nodemailer` + `@types/nodemailer` — SMTP générique
- `@react-email/components` + `@react-email/render` — template email
- `qrcode` + `@types/qrcode` — génération QR PNG
- `nanoid` — tokens (probablement déjà présent)
- `papaparse` — parsing CSV/TSV côté client
- `dexie` — wrapper IndexedDB (scanner)
- `html5-qrcode` — webcam QR scan
- `recharts` — graphiques dashboard (area + donut)
