-- GetStage Live MVP — Schema
-- Migration: 20260415000001_getstage_live

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

CREATE TYPE event_visibility AS ENUM ('public', 'private');

CREATE TYPE ticket_status AS ENUM ('issued', 'sent', 'checked_in', 'void');

CREATE TYPE check_in_result AS ENUM ('ok', 'duplicate', 'invalid', 'void');

CREATE TYPE organizer_role AS ENUM ('owner', 'scanner');

CREATE TYPE email_provider AS ENUM ('getstage_default', 'resend_custom', 'smtp');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Events
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

-- Tickets
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

-- Check-ins
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

-- Email settings per event (BYOD: bring your own domain / SMTP)
CREATE TABLE event_email_settings (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  provider email_provider NOT NULL DEFAULT 'getstage_default',

  -- Common to all non-default providers
  from_email TEXT,                       -- ex: billets@client.com
  from_name TEXT,                        -- ex: "Release Party by Client"
  reply_to TEXT,

  -- If provider = 'resend_custom'
  resend_api_key_encrypted TEXT,
  resend_domain_verified BOOLEAN NOT NULL DEFAULT false,

  -- If provider = 'smtp': nodemailer generic
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
CREATE TABLE organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role organizer_role NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_events_visibility ON events(visibility);
CREATE INDEX idx_events_slug ON events(slug) WHERE visibility = 'public';

CREATE INDEX idx_ticket_tiers_event ON ticket_tiers(event_id);

CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_token ON tickets(token);
CREATE INDEX idx_tickets_email ON tickets(buyer_email);

CREATE INDEX idx_check_ins_event ON check_ins(event_id);
CREATE INDEX idx_check_ins_ticket ON check_ins(ticket_id);

-- Dedup: only one 'ok' check-in per ticket
CREATE UNIQUE INDEX idx_check_ins_ticket_ok
  ON check_ins(ticket_id)
  WHERE result = 'ok';

CREATE INDEX idx_organizers_user ON organizers(user_id);
CREATE INDEX idx_organizers_event ON organizers(event_id);

-- ============================================================
-- 4. RLS
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_email_settings ENABLE ROW LEVEL SECURITY;

-- events : public can only read public events
CREATE POLICY events_public_read ON events
  FOR SELECT TO anon, authenticated
  USING (visibility = 'public');

-- events : event organizer (owner) can do everything
CREATE POLICY events_organizer_all ON events
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organizers
    WHERE organizers.event_id = events.id
      AND organizers.user_id = auth.uid()
      AND organizers.role = 'owner'
  ));

-- ticket_tiers : organizer can do everything, public reads if event is public
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

-- tickets : never readable by anon except via RPC by token (see below)
-- scanner (role=scanner) can read tickets for their event
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

-- check_ins : scanner/owner of the event can read + insert
CREATE POLICY checkins_staff_all ON check_ins
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM organizers o
    WHERE o.event_id = check_ins.event_id
      AND o.user_id = auth.uid()
      AND o.role IN ('owner', 'scanner')
  ));

-- organizers : each user reads their own rows
CREATE POLICY organizers_self_read ON organizers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- event_email_settings : no permissive policy — everything is locked down.
-- Server actions use service_role (bypass RLS) to read/write.

-- ============================================================
-- 5. RPC FUNCTION
-- ============================================================

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

-- ============================================================
-- 6. GRANTS
-- ============================================================

GRANT EXECUTE ON FUNCTION public.get_ticket_by_token(TEXT) TO anon, authenticated;
