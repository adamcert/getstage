-- Events Platform - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Created: 2025-02-04

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =============================================================================
-- ENUMS
-- =============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('user', 'organizer', 'admin');

-- User subscription plans
CREATE TYPE user_plan AS ENUM ('free', 'pro', 'business');

-- Venue categories
CREATE TYPE venue_category AS ENUM (
  'bar',
  'club',
  'restaurant',
  'theatre',
  'gallery',
  'concert_hall',
  'stadium',
  'outdoor',
  'other'
);

-- Event categories
CREATE TYPE event_category AS ENUM (
  'concert',
  'dj',
  'theatre',
  'comedy',
  'expo',
  'film',
  'party',
  'festival',
  'conference',
  'workshop',
  'other'
);

-- Event lifecycle status
CREATE TYPE event_status AS ENUM (
  'draft',      -- Not visible, still editing
  'preview',    -- Accessible via preview link only
  'published',  -- Live and visible to all
  'cancelled',  -- Event cancelled
  'past'        -- Event has ended
);

-- Order payment status
CREATE TYPE order_status AS ENUM (
  'pending',    -- Awaiting payment
  'paid',       -- Payment successful
  'refunded',   -- Full refund issued
  'cancelled'   -- Order cancelled
);

-- Ticket lifecycle status
CREATE TYPE ticket_status AS ENUM (
  'valid',       -- Can be used
  'used',        -- Already scanned
  'resale',      -- Listed for resale
  'transferred', -- Transferred to another user
  'refunded'     -- Refunded
);

-- Gift card status
CREATE TYPE gift_card_status AS ENUM (
  'active',   -- Can be used
  'used',     -- Fully redeemed
  'expired'   -- Past expiration date
);

-- Collaborator permission levels
CREATE TYPE collaborator_role AS ENUM (
  'admin',   -- Full access
  'editor',  -- Can edit event details
  'staff'    -- Can scan tickets only
);

-- Email template types
CREATE TYPE email_template_type AS ENUM (
  'confirmation',   -- Order confirmation
  'reminder',       -- Event reminder (24h before)
  'day_of',         -- Day of event notification
  'cancellation'    -- Event cancellation notice
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PROFILES - Extends Supabase auth.users
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  plan user_plan DEFAULT 'free' NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_connect_id TEXT UNIQUE,
  preferred_language TEXT DEFAULT 'fr',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for purchases';
COMMENT ON COLUMN public.profiles.stripe_connect_id IS 'Stripe Connect ID for organizers receiving payments';

-- -----------------------------------------------------------------------------
-- VENUES - Event locations
-- -----------------------------------------------------------------------------
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category venue_category DEFAULT 'other' NOT NULL,
  -- Address
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,
  -- Media
  cover_image TEXT,
  logo TEXT,
  gallery TEXT[] DEFAULT '{}',
  -- Additional info
  social_links JSONB DEFAULT '{}'::jsonb,
  opening_hours JSONB DEFAULT '{}'::jsonb,
  amenities TEXT[] DEFAULT '{}',
  capacity INTEGER,
  -- Status
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.venues IS 'Venues where events take place';
COMMENT ON COLUMN public.venues.social_links IS 'JSON object with social media links {instagram, facebook, twitter, etc}';
COMMENT ON COLUMN public.venues.opening_hours IS 'JSON object with opening hours per day';

-- -----------------------------------------------------------------------------
-- ARTISTS - Performers at events
-- -----------------------------------------------------------------------------
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  image_url TEXT,
  genres TEXT[] DEFAULT '{}',
  -- Music platform IDs
  spotify_id TEXT UNIQUE,
  apple_music_id TEXT,
  soundcloud_url TEXT,
  -- Social links
  social_links JSONB DEFAULT '{}'::jsonb,
  -- Metadata
  monthly_listeners INTEGER,
  popularity_score INTEGER,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.artists IS 'Artists and performers';
COMMENT ON COLUMN public.artists.spotify_id IS 'Spotify artist ID for API integration';
COMMENT ON COLUMN public.artists.monthly_listeners IS 'Monthly listeners from Spotify (cached)';

-- -----------------------------------------------------------------------------
-- EVENTS - Main events table
-- -----------------------------------------------------------------------------
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Basic info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category event_category DEFAULT 'other' NOT NULL,
  music_genres TEXT[] DEFAULT '{}',
  -- Media
  cover_image TEXT,
  gallery TEXT[] DEFAULT '{}',
  video_url TEXT,
  -- Date/Time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  doors_open TIMESTAMPTZ,
  -- Status
  status event_status DEFAULT 'draft' NOT NULL,
  preview_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  -- Flags
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  is_new BOOLEAN DEFAULT TRUE NOT NULL,
  allows_resale BOOLEAN DEFAULT TRUE NOT NULL,
  resale_max_markup DECIMAL(3, 2) DEFAULT 1.20, -- Max 20% markup by default
  -- Policies
  min_age INTEGER,
  dress_code TEXT,
  additional_info TEXT,
  refund_policy TEXT,
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date),
  CONSTRAINT valid_doors CHECK (doors_open IS NULL OR doors_open <= start_date)
);

COMMENT ON TABLE public.events IS 'Main events table';
COMMENT ON COLUMN public.events.preview_token IS 'Secret token for preview access before publishing';
COMMENT ON COLUMN public.events.resale_max_markup IS 'Maximum allowed resale price multiplier (1.2 = 20% above original)';

-- -----------------------------------------------------------------------------
-- EVENT_ARTISTS - Event lineup (many-to-many)
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  -- Performance details
  set_time TIMESTAMPTZ,
  set_end_time TIMESTAMPTZ,
  stage TEXT,
  -- Display
  is_headliner BOOLEAN DEFAULT FALSE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Constraints
  UNIQUE(event_id, artist_id),
  CONSTRAINT valid_set_times CHECK (set_end_time IS NULL OR set_end_time > set_time)
);

COMMENT ON TABLE public.event_artists IS 'Event lineup - artists performing at events';

-- -----------------------------------------------------------------------------
-- TICKET_TYPES - Different ticket categories for an event
-- -----------------------------------------------------------------------------
CREATE TABLE public.ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  -- Ticket info
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  -- Inventory
  quantity_total INTEGER NOT NULL CHECK (quantity_total > 0),
  quantity_sold INTEGER DEFAULT 0 NOT NULL CHECK (quantity_sold >= 0),
  quantity_reserved INTEGER DEFAULT 0 NOT NULL CHECK (quantity_reserved >= 0),
  -- Limits
  max_per_order INTEGER DEFAULT 10 NOT NULL CHECK (max_per_order > 0),
  min_per_order INTEGER DEFAULT 1 NOT NULL CHECK (min_per_order > 0),
  -- Sale window
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  -- Display
  is_visible BOOLEAN DEFAULT TRUE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Constraints
  CONSTRAINT valid_inventory CHECK (quantity_sold + quantity_reserved <= quantity_total),
  CONSTRAINT valid_per_order CHECK (min_per_order <= max_per_order),
  CONSTRAINT valid_sale_window CHECK (sale_end IS NULL OR sale_start IS NULL OR sale_end > sale_start)
);

COMMENT ON TABLE public.ticket_types IS 'Ticket categories/tiers for events';
COMMENT ON COLUMN public.ticket_types.quantity_reserved IS 'Tickets currently in shopping carts (temporary hold)';

-- -----------------------------------------------------------------------------
-- ORDERS - Purchase records
-- -----------------------------------------------------------------------------
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Order number (human readable)
  order_number TEXT UNIQUE NOT NULL DEFAULT 'EVT-' || UPPER(encode(gen_random_bytes(4), 'hex')),
  -- Status
  status order_status DEFAULT 'pending' NOT NULL,
  -- Amounts
  subtotal_amount DECIMAL(10, 2) NOT NULL CHECK (subtotal_amount >= 0),
  fees_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL CHECK (fees_amount >= 0),
  discount_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL CHECK (discount_amount >= 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  -- Stripe
  stripe_payment_intent TEXT UNIQUE,
  stripe_session_id TEXT UNIQUE,
  -- Gift card
  gift_card_id UUID,
  gift_card_amount DECIMAL(10, 2) DEFAULT 0 CHECK (gift_card_amount >= 0),
  -- Promo code
  promo_code_id UUID,
  promo_code_discount DECIMAL(10, 2) DEFAULT 0 CHECK (promo_code_discount >= 0),
  -- Customer info (for guest checkout)
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  -- Billing address
  billing_address JSONB,
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

COMMENT ON TABLE public.orders IS 'Purchase orders';
COMMENT ON COLUMN public.orders.order_number IS 'Human-readable order number for support';

-- -----------------------------------------------------------------------------
-- TICKETS - Individual tickets
-- -----------------------------------------------------------------------------
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Ticket identification
  qr_code TEXT UNIQUE NOT NULL,
  ticket_number TEXT UNIQUE NOT NULL DEFAULT 'TKT-' || UPPER(encode(gen_random_bytes(6), 'hex')),
  -- Status
  status ticket_status DEFAULT 'valid' NOT NULL,
  -- Pricing
  price_paid DECIMAL(10, 2) NOT NULL CHECK (price_paid >= 0),
  -- Resale
  resale_price DECIMAL(10, 2) CHECK (resale_price >= 0),
  resale_listed_at TIMESTAMPTZ,
  original_ticket_id UUID REFERENCES public.tickets(id),
  -- Attendee info
  attendee_name TEXT,
  attendee_email TEXT,
  -- Scanning
  scanned_at TIMESTAMPTZ,
  scanned_by UUID REFERENCES public.profiles(id),
  scan_location TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  transferred_at TIMESTAMPTZ
);

COMMENT ON TABLE public.tickets IS 'Individual tickets';
COMMENT ON COLUMN public.tickets.qr_code IS 'Unique QR code for ticket validation';
COMMENT ON COLUMN public.tickets.original_ticket_id IS 'Reference to original ticket if this is from resale';

-- -----------------------------------------------------------------------------
-- GIFT_CARDS - Gift card management
-- -----------------------------------------------------------------------------
CREATE TABLE public.gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Card identification
  code TEXT UNIQUE NOT NULL,
  -- Value
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  balance DECIMAL(10, 2) NOT NULL CHECK (balance >= 0),
  currency TEXT DEFAULT 'EUR' NOT NULL,
  -- Purchaser
  purchaser_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  purchaser_email TEXT,
  -- Recipient
  recipient_email TEXT,
  recipient_name TEXT,
  -- Message
  sender_name TEXT,
  message TEXT,
  -- Design
  design_template TEXT DEFAULT 'default' NOT NULL,
  custom_image_url TEXT,
  -- Status
  status gift_card_status DEFAULT 'active' NOT NULL,
  -- Payment
  stripe_payment_intent TEXT UNIQUE,
  -- Dates
  expires_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES public.profiles(id),
  redeemed_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Constraints
  CONSTRAINT valid_balance CHECK (balance <= amount)
);

COMMENT ON TABLE public.gift_cards IS 'Gift cards for platform purchases';

-- -----------------------------------------------------------------------------
-- WAITLIST - Ticket availability notifications
-- -----------------------------------------------------------------------------
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  -- Specific ticket type preference
  ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  -- Notification status
  notified BOOLEAN DEFAULT FALSE NOT NULL,
  notified_at TIMESTAMPTZ,
  notification_count INTEGER DEFAULT 0 NOT NULL,
  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE NOT NULL,
  converted_order_id UUID REFERENCES public.orders(id),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Constraints
  UNIQUE(event_id, email)
);

COMMENT ON TABLE public.waitlist IS 'Users waiting for ticket availability';

-- -----------------------------------------------------------------------------
-- EVENT_COLLABORATORS - Team members for event management
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Role and permissions
  role collaborator_role DEFAULT 'staff' NOT NULL,
  custom_permissions JSONB DEFAULT '{}'::jsonb,
  -- Invitation
  invited_by UUID REFERENCES public.profiles(id),
  invited_email TEXT,
  invitation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  -- Status
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  -- Constraints
  UNIQUE(event_id, user_id)
);

COMMENT ON TABLE public.event_collaborators IS 'Team members with access to event management';

-- -----------------------------------------------------------------------------
-- EMAIL_TEMPLATES - Custom email templates per venue/organizer
-- -----------------------------------------------------------------------------
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Template info
  type email_template_type NOT NULL,
  name TEXT NOT NULL,
  -- Content
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  -- Variables available in template
  available_variables TEXT[] DEFAULT '{}',
  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- At least one of venue_id or organizer_id must be set
  CONSTRAINT email_template_owner CHECK (venue_id IS NOT NULL OR organizer_id IS NOT NULL)
);

COMMENT ON TABLE public.email_templates IS 'Custom email templates for automated communications';

-- -----------------------------------------------------------------------------
-- PROMO_CODES - Discount codes
-- -----------------------------------------------------------------------------
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Scope (can be event-specific, venue-specific, or global)
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Code
  code TEXT NOT NULL,
  description TEXT,
  -- Discount
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  -- Limits
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0 NOT NULL CHECK (current_uses >= 0),
  min_order_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  -- Validity
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  -- Restrictions
  applicable_ticket_types UUID[] DEFAULT '{}',
  first_time_buyers_only BOOLEAN DEFAULT FALSE NOT NULL,
  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Constraints
  UNIQUE(code, event_id),
  UNIQUE(code, venue_id),
  CONSTRAINT valid_promo_period CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until > valid_from),
  CONSTRAINT valid_percentage CHECK (discount_type != 'percentage' OR (discount_value > 0 AND discount_value <= 100))
);

COMMENT ON TABLE public.promo_codes IS 'Promotional discount codes';

-- -----------------------------------------------------------------------------
-- FAVORITES - User favorites/saved events
-- -----------------------------------------------------------------------------
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, event_id)
);

COMMENT ON TABLE public.favorites IS 'User saved/favorited events';

-- -----------------------------------------------------------------------------
-- FOLLOWS - User following venues/artists
-- -----------------------------------------------------------------------------
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Must follow either venue or artist
  CONSTRAINT follow_target CHECK (
    (venue_id IS NOT NULL AND artist_id IS NULL) OR
    (venue_id IS NULL AND artist_id IS NOT NULL)
  ),
  UNIQUE(user_id, venue_id),
  UNIQUE(user_id, artist_id)
);

COMMENT ON TABLE public.follows IS 'User following venues or artists for updates';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Performance Indexes
-- -----------------------------------------------------------------------------

-- Profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Venues
CREATE INDEX idx_venues_owner ON public.venues(owner_id);
CREATE INDEX idx_venues_city ON public.venues(city);
CREATE INDEX idx_venues_category ON public.venues(category);
CREATE INDEX idx_venues_published ON public.venues(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_venues_location ON public.venues(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Artists
CREATE INDEX idx_artists_genres ON public.artists USING gin(genres);
CREATE INDEX idx_artists_spotify ON public.artists(spotify_id) WHERE spotify_id IS NOT NULL;

-- Events
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_venue ON public.events(venue_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_published ON public.events(status, start_date) WHERE status = 'published';
CREATE INDEX idx_events_featured ON public.events(is_featured, start_date) WHERE is_featured = TRUE AND status = 'published';
CREATE INDEX idx_events_genres ON public.events USING gin(music_genres);
CREATE INDEX idx_events_preview_token ON public.events(preview_token) WHERE preview_token IS NOT NULL;

-- Event Artists
CREATE INDEX idx_event_artists_event ON public.event_artists(event_id);
CREATE INDEX idx_event_artists_artist ON public.event_artists(artist_id);
CREATE INDEX idx_event_artists_headliner ON public.event_artists(event_id, is_headliner) WHERE is_headliner = TRUE;

-- Ticket Types
CREATE INDEX idx_ticket_types_event ON public.ticket_types(event_id);
CREATE INDEX idx_ticket_types_available ON public.ticket_types(event_id, is_visible)
  WHERE is_visible = TRUE;

-- Orders
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_orders_stripe_payment ON public.orders(stripe_payment_intent) WHERE stripe_payment_intent IS NOT NULL;

-- Tickets
CREATE INDEX idx_tickets_order ON public.tickets(order_id);
CREATE INDEX idx_tickets_event ON public.tickets(event_id);
CREATE INDEX idx_tickets_user ON public.tickets(user_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_qr ON public.tickets(qr_code);
CREATE INDEX idx_tickets_resale ON public.tickets(event_id, status, resale_price) WHERE status = 'resale';

-- Gift Cards
CREATE INDEX idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX idx_gift_cards_purchaser ON public.gift_cards(purchaser_id);
CREATE INDEX idx_gift_cards_status ON public.gift_cards(status) WHERE status = 'active';

-- Waitlist
CREATE INDEX idx_waitlist_event ON public.waitlist(event_id);
CREATE INDEX idx_waitlist_user ON public.waitlist(user_id);
CREATE INDEX idx_waitlist_pending ON public.waitlist(event_id, notified) WHERE notified = FALSE;

-- Event Collaborators
CREATE INDEX idx_event_collaborators_event ON public.event_collaborators(event_id);
CREATE INDEX idx_event_collaborators_user ON public.event_collaborators(user_id);

-- Promo Codes
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_event ON public.promo_codes(event_id);
CREATE INDEX idx_promo_codes_active ON public.promo_codes(code, is_active) WHERE is_active = TRUE;

-- Favorites
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_event ON public.favorites(event_id);

-- Follows
CREATE INDEX idx_follows_user ON public.follows(user_id);
CREATE INDEX idx_follows_venue ON public.follows(venue_id) WHERE venue_id IS NOT NULL;
CREATE INDEX idx_follows_artist ON public.follows(artist_id) WHERE artist_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Full Text Search Indexes
-- -----------------------------------------------------------------------------

-- Events full text search (French)
CREATE INDEX idx_events_search ON public.events
  USING gin(to_tsvector('french', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, '')));

-- Venues full text search (French)
CREATE INDEX idx_venues_search ON public.venues
  USING gin(to_tsvector('french', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(city, '')));

-- Artists full text search (French)
CREATE INDEX idx_artists_search ON public.artists
  USING gin(to_tsvector('french', COALESCE(name, '') || ' ' || COALESCE(bio, '')));

-- Trigram indexes for fuzzy search
CREATE INDEX idx_events_title_trgm ON public.events USING gin(title gin_trgm_ops);
CREATE INDEX idx_venues_name_trgm ON public.venues USING gin(name gin_trgm_ops);
CREATE INDEX idx_artists_name_trgm ON public.artists USING gin(name gin_trgm_ops);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PROFILES Policies
-- -----------------------------------------------------------------------------

-- Anyone can view profiles (for displaying organizer info, etc.)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles are created via trigger, no direct insert needed for normal users
CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- VENUES Policies
-- -----------------------------------------------------------------------------

-- Anyone can view published venues, owners can view their own
CREATE POLICY "Published venues are viewable by everyone"
  ON public.venues FOR SELECT
  USING (is_published = true OR owner_id = auth.uid());

-- Organizers and admins can create venues
CREATE POLICY "Organizers can insert venues"
  ON public.venues FOR INSERT
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin'))
  );

-- Owners can update their venues
CREATE POLICY "Owners can update venues"
  ON public.venues FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Owners can delete their venues
CREATE POLICY "Owners can delete venues"
  ON public.venues FOR DELETE
  USING (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- ARTISTS Policies
-- -----------------------------------------------------------------------------

-- Anyone can view artists
CREATE POLICY "Artists are viewable by everyone"
  ON public.artists FOR SELECT
  USING (true);

-- Organizers and admins can create/update artists
CREATE POLICY "Organizers can manage artists"
  ON public.artists FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin'))
  );

-- -----------------------------------------------------------------------------
-- EVENTS Policies
-- -----------------------------------------------------------------------------

-- Anyone can view published events, organizers can view their own
CREATE POLICY "Published events are viewable by everyone"
  ON public.events FOR SELECT
  USING (
    status IN ('published', 'past') OR
    organizer_id = auth.uid() OR
    -- Collaborators can view
    EXISTS (
      SELECT 1 FROM public.event_collaborators
      WHERE event_id = id AND user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

-- Organizers can create events
CREATE POLICY "Organizers can insert events"
  ON public.events FOR INSERT
  WITH CHECK (
    organizer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin'))
  );

-- Organizers and admin collaborators can update events
CREATE POLICY "Organizers can update events"
  ON public.events FOR UPDATE
  USING (
    organizer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.event_collaborators
      WHERE event_id = id AND user_id = auth.uid() AND role IN ('admin', 'editor') AND accepted_at IS NOT NULL
    )
  )
  WITH CHECK (
    organizer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.event_collaborators
      WHERE event_id = id AND user_id = auth.uid() AND role IN ('admin', 'editor') AND accepted_at IS NOT NULL
    )
  );

-- Only organizers can delete events
CREATE POLICY "Organizers can delete events"
  ON public.events FOR DELETE
  USING (organizer_id = auth.uid());

-- -----------------------------------------------------------------------------
-- EVENT_ARTISTS Policies
-- -----------------------------------------------------------------------------

-- Anyone can view event artists for published events
CREATE POLICY "Event artists viewable for published events"
  ON public.event_artists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND (status IN ('published', 'past') OR organizer_id = auth.uid())
    )
  );

-- Event organizers can manage lineup
CREATE POLICY "Organizers can manage event artists"
  ON public.event_artists FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- TICKET_TYPES Policies
-- -----------------------------------------------------------------------------

-- Anyone can view ticket types for published events
CREATE POLICY "Ticket types viewable for published events"
  ON public.ticket_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND (status = 'published' OR organizer_id = auth.uid())
    )
  );

-- Event organizers can manage ticket types
CREATE POLICY "Organizers can manage ticket types"
  ON public.ticket_types FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- ORDERS Policies
-- -----------------------------------------------------------------------------

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

-- Anyone can create an order (guest checkout allowed)
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can update their pending orders
CREATE POLICY "Users can update pending orders"
  ON public.orders FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

-- Organizers can view orders for their events
CREATE POLICY "Organizers can view event orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      JOIN public.events e ON e.id = t.event_id
      WHERE t.order_id = orders.id AND e.organizer_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- TICKETS Policies
-- -----------------------------------------------------------------------------

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  USING (user_id = auth.uid());

-- Anyone can view resale tickets
CREATE POLICY "Resale tickets are public"
  ON public.tickets FOR SELECT
  USING (status = 'resale');

-- Users can update their own tickets (for resale listing)
CREATE POLICY "Users can update own tickets"
  ON public.tickets FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Event organizers and staff can view tickets for scanning
CREATE POLICY "Event staff can view tickets"
  ON public.tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      LEFT JOIN public.event_collaborators ec ON ec.event_id = e.id
      WHERE e.id = tickets.event_id AND (
        e.organizer_id = auth.uid() OR
        (ec.user_id = auth.uid() AND ec.accepted_at IS NOT NULL)
      )
    )
  );

-- Event staff can update tickets (for scanning)
CREATE POLICY "Event staff can scan tickets"
  ON public.tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      LEFT JOIN public.event_collaborators ec ON ec.event_id = e.id
      WHERE e.id = tickets.event_id AND (
        e.organizer_id = auth.uid() OR
        (ec.user_id = auth.uid() AND ec.accepted_at IS NOT NULL)
      )
    )
  );

-- -----------------------------------------------------------------------------
-- GIFT_CARDS Policies
-- -----------------------------------------------------------------------------

-- Users can view gift cards they purchased
CREATE POLICY "Users can view purchased gift cards"
  ON public.gift_cards FOR SELECT
  USING (purchaser_id = auth.uid());

-- Anyone can check a gift card by code (for redemption)
CREATE POLICY "Gift cards can be checked by code"
  ON public.gift_cards FOR SELECT
  USING (true);

-- Users can create gift cards
CREATE POLICY "Users can purchase gift cards"
  ON public.gift_cards FOR INSERT
  WITH CHECK (purchaser_id = auth.uid() OR purchaser_id IS NULL);

-- -----------------------------------------------------------------------------
-- WAITLIST Policies
-- -----------------------------------------------------------------------------

-- Users can view their waitlist entries
CREATE POLICY "Users can view own waitlist"
  ON public.waitlist FOR SELECT
  USING (user_id = auth.uid());

-- Anyone can join waitlist
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can remove themselves from waitlist
CREATE POLICY "Users can leave waitlist"
  ON public.waitlist FOR DELETE
  USING (user_id = auth.uid());

-- Event organizers can view their event's waitlist
CREATE POLICY "Organizers can view event waitlist"
  ON public.waitlist FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- EVENT_COLLABORATORS Policies
-- -----------------------------------------------------------------------------

-- Collaborators can view their own entries
CREATE POLICY "Collaborators can view own entries"
  ON public.event_collaborators FOR SELECT
  USING (user_id = auth.uid());

-- Event organizers can view and manage collaborators
CREATE POLICY "Organizers can manage collaborators"
  ON public.event_collaborators FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

-- Invited users can accept their invitation
CREATE POLICY "Users can accept invitations"
  ON public.event_collaborators FOR UPDATE
  USING (user_id = auth.uid() AND accepted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- EMAIL_TEMPLATES Policies
-- -----------------------------------------------------------------------------

-- Organizers can manage their email templates
CREATE POLICY "Organizers can manage email templates"
  ON public.email_templates FOR ALL
  USING (
    organizer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.venues WHERE id = venue_id AND owner_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- PROMO_CODES Policies
-- -----------------------------------------------------------------------------

-- Anyone can check promo codes (for validation)
CREATE POLICY "Promo codes can be checked"
  ON public.promo_codes FOR SELECT
  USING (true);

-- Organizers can manage promo codes
CREATE POLICY "Organizers can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (
    organizer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.venues WHERE id = venue_id AND owner_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- FAVORITES Policies
-- -----------------------------------------------------------------------------

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (user_id = auth.uid());

-- Users can manage their favorites
CREATE POLICY "Users can manage favorites"
  ON public.favorites FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- FOLLOWS Policies
-- -----------------------------------------------------------------------------

-- Users can view their own follows
CREATE POLICY "Users can view own follows"
  ON public.follows FOR SELECT
  USING (user_id = auth.uid());

-- Users can manage their follows
CREATE POLICY "Users can manage follows"
  ON public.follows FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Venues and artists can see their follower count (aggregated, not individual users)
CREATE POLICY "Venues can see follower count"
  ON public.follows FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.venues WHERE id = venue_id AND owner_id = auth.uid())
  );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Auto-update updated_at timestamp
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Handle new user signup - create profile
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Update ticket quantity sold when ticket created
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_ticket_quantity_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ticket_types
  SET quantity_sold = quantity_sold + 1
  WHERE id = NEW.ticket_type_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Update ticket quantity on ticket refund/delete
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_ticket_quantity_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If ticket is being refunded, decrement the sold count
  IF NEW.status = 'refunded' AND OLD.status != 'refunded' THEN
    UPDATE public.ticket_types
    SET quantity_sold = quantity_sold - 1
    WHERE id = NEW.ticket_type_id AND quantity_sold > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Generate unique QR code for ticket
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_ticket_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code = 'QR-' || UPPER(encode(gen_random_bytes(12), 'hex'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Generate unique gift card code
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code = 'GC-' || UPPER(encode(gen_random_bytes(6), 'hex'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Update event status to 'past' after end date
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_past_events()
RETURNS void AS $$
BEGIN
  UPDATE public.events
  SET status = 'past'
  WHERE status = 'published'
    AND (end_date < NOW() OR (end_date IS NULL AND start_date < NOW() - INTERVAL '6 hours'));
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Check ticket availability
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_ticket_availability(
  p_ticket_type_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  SELECT quantity_total - quantity_sold - quantity_reserved
  INTO v_available
  FROM public.ticket_types
  WHERE id = p_ticket_type_id;

  RETURN v_available >= p_quantity;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Reserve tickets (for cart)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reserve_tickets(
  p_ticket_type_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.ticket_types
  SET quantity_reserved = quantity_reserved + p_quantity
  WHERE id = p_ticket_type_id
    AND quantity_total - quantity_sold - quantity_reserved >= p_quantity;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Release reserved tickets (cart expiry or checkout)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION release_tickets(
  p_ticket_type_id UUID,
  p_quantity INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE public.ticket_types
  SET quantity_reserved = GREATEST(0, quantity_reserved - p_quantity)
  WHERE id = p_ticket_type_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Calculate promo code discount
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_promo_discount(
  p_promo_code_id UUID,
  p_subtotal DECIMAL(10, 2)
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_discount DECIMAL(10, 2);
  v_promo RECORD;
BEGIN
  SELECT * INTO v_promo
  FROM public.promo_codes
  WHERE id = p_promo_code_id
    AND is_active = TRUE
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses);

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  IF v_promo.min_order_amount IS NOT NULL AND p_subtotal < v_promo.min_order_amount THEN
    RETURN 0;
  END IF;

  IF v_promo.discount_type = 'percentage' THEN
    v_discount = p_subtotal * (v_promo.discount_value / 100);
  ELSE
    v_discount = v_promo.discount_value;
  END IF;

  IF v_promo.max_discount_amount IS NOT NULL THEN
    v_discount = LEAST(v_discount, v_promo.max_discount_amount);
  END IF;

  RETURN LEAST(v_discount, p_subtotal);
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Full text search function for events
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_events(
  p_query TEXT,
  p_city TEXT DEFAULT NULL,
  p_category event_category DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  cover_image TEXT,
  start_date TIMESTAMPTZ,
  category event_category,
  venue_name TEXT,
  venue_city TEXT,
  min_price DECIMAL,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    e.id,
    e.title,
    e.slug,
    e.cover_image,
    e.start_date,
    e.category,
    v.name AS venue_name,
    v.city AS venue_city,
    MIN(tt.price) AS min_price,
    ts_rank(
      to_tsvector('french', COALESCE(e.title, '') || ' ' || COALESCE(e.description, '')),
      plainto_tsquery('french', p_query)
    ) AS rank
  FROM public.events e
  LEFT JOIN public.venues v ON v.id = e.venue_id
  LEFT JOIN public.ticket_types tt ON tt.event_id = e.id AND tt.is_visible = TRUE
  WHERE e.status = 'published'
    AND e.start_date > NOW()
    AND (p_query IS NULL OR
      to_tsvector('french', COALESCE(e.title, '') || ' ' || COALESCE(e.description, ''))
      @@ plainto_tsquery('french', p_query)
      OR e.title ILIKE '%' || p_query || '%'
    )
    AND (p_city IS NULL OR v.city ILIKE '%' || p_city || '%')
    AND (p_category IS NULL OR e.category = p_category)
    AND (p_start_date IS NULL OR e.start_date >= p_start_date)
    AND (p_end_date IS NULL OR e.start_date <= p_end_date)
  GROUP BY e.id, e.title, e.slug, e.cover_image, e.start_date, e.category, v.name, v.city
  ORDER BY rank DESC, e.start_date ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Get events near location
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_events_near_location(
  p_latitude DECIMAL,
  p_longitude DECIMAL,
  p_radius_km INTEGER DEFAULT 50,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  cover_image TEXT,
  start_date TIMESTAMPTZ,
  venue_name TEXT,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.slug,
    e.cover_image,
    e.start_date,
    v.name AS venue_name,
    (
      6371 * acos(
        cos(radians(p_latitude)) * cos(radians(v.latitude)) *
        cos(radians(v.longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(v.latitude))
      )
    )::DECIMAL AS distance_km
  FROM public.events e
  JOIN public.venues v ON v.id = e.venue_id
  WHERE e.status = 'published'
    AND e.start_date > NOW()
    AND v.latitude IS NOT NULL
    AND v.longitude IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(p_latitude)) * cos(radians(v.latitude)) *
        cos(radians(v.longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(v.latitude))
      )
    ) <= p_radius_km
  ORDER BY distance_km ASC, e.start_date ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Updated_at triggers
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ticket_types_updated_at
  BEFORE UPDATE ON public.ticket_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gift_cards_updated_at
  BEFORE UPDATE ON public.gift_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- Auth user created trigger
-- -----------------------------------------------------------------------------
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -----------------------------------------------------------------------------
-- Ticket triggers
-- -----------------------------------------------------------------------------
CREATE TRIGGER generate_ticket_qr_code_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_qr_code();

CREATE TRIGGER update_ticket_quantity_on_insert_trigger
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_ticket_quantity_on_insert();

CREATE TRIGGER update_ticket_quantity_on_status_trigger
  AFTER UPDATE OF status ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_ticket_quantity_on_status_change();

-- -----------------------------------------------------------------------------
-- Gift card code generation trigger
-- -----------------------------------------------------------------------------
CREATE TRIGGER generate_gift_card_code_trigger
  BEFORE INSERT ON public.gift_cards
  FOR EACH ROW EXECUTE FUNCTION generate_gift_card_code();

-- =============================================================================
-- SCHEDULED JOBS (to be run via pg_cron or external scheduler)
-- =============================================================================

-- Note: These functions should be called periodically by a scheduler:
-- 1. update_past_events() - Run hourly to mark ended events as 'past'
-- 2. Release expired cart reservations - Run every 15 minutes

-- Example pg_cron setup (run after enabling pg_cron extension):
-- SELECT cron.schedule('update-past-events', '0 * * * *', 'SELECT update_past_events()');

-- =============================================================================
-- INITIAL DATA (Optional)
-- =============================================================================

-- Insert default email templates
INSERT INTO public.email_templates (organizer_id, type, name, subject, body_html, available_variables, is_default)
VALUES
  (NULL, 'confirmation', 'Default Confirmation', 'Confirmation de votre commande {{order_number}}',
   '<h1>Merci pour votre commande!</h1><p>Votre commande {{order_number}} a été confirmée.</p>',
   ARRAY['order_number', 'customer_name', 'event_title', 'event_date', 'tickets'], TRUE),
  (NULL, 'reminder', 'Default Reminder', 'Rappel: {{event_title}} demain!',
   '<h1>N''oubliez pas!</h1><p>{{event_title}} a lieu demain à {{event_time}}.</p>',
   ARRAY['event_title', 'event_date', 'event_time', 'venue_name', 'venue_address'], TRUE),
  (NULL, 'day_of', 'Default Day-Of', 'C''est aujourd''hui: {{event_title}}!',
   '<h1>Le grand jour est arrivé!</h1><p>{{event_title}} commence à {{event_time}}.</p>',
   ARRAY['event_title', 'event_time', 'venue_name', 'venue_address', 'qr_code'], TRUE),
  (NULL, 'cancellation', 'Default Cancellation', 'Événement annulé: {{event_title}}',
   '<h1>Événement annulé</h1><p>Nous sommes désolés, {{event_title}} a été annulé. Vous serez remboursé sous 5-7 jours ouvrés.</p>',
   ARRAY['event_title', 'event_date', 'refund_amount'], TRUE);

-- =============================================================================
-- GRANTS (for service role access)
-- =============================================================================

-- Grant usage on all sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant function execution
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
