# Events Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modern event ticketing platform with resale, gift cards, and Spotify integration.

**Architecture:** Next.js 14 App Router frontend with Supabase backend (auth, database, storage, realtime). Stripe Connect for payments, Mapbox for maps, Spotify/Apple Music for artist data.

**Tech Stack:** Next.js 14, TypeScript, Supabase, Tailwind CSS, Framer Motion, Stripe, Mapbox GL, Spotify Web API

---

## Phase 1: Project Setup & Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `.env.local.example`

**Step 1: Create Next.js app with TypeScript and Tailwind**

Run:
```bash
cd /Applications/MAMP/htdocs/event
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Expected: Project scaffolded with Next.js 14, TypeScript, Tailwind

**Step 2: Install core dependencies**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr framer-motion lucide-react clsx tailwind-merge date-fns zustand
```

Expected: Dependencies installed

**Step 3: Install dev dependencies**

Run:
```bash
npm install -D @types/node supabase
```

Expected: Dev dependencies installed

**Step 4: Create environment template**

Create `.env.local.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js 14 project with TypeScript and Tailwind"
```

---

### Task 2: Setup Tailwind with Design System

**Files:**
- Modify: `tailwind.config.ts`
- Create: `app/globals.css`
- Create: `lib/utils.ts`

**Step 1: Configure Tailwind with brand colors**

Modify `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#FF6B6B",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        secondary: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        accent: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        surface: "#FFFFFF",
        background: "#FAFAFA",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Update global styles**

Replace `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 250 250 250;
    --foreground: 31 41 55;
  }

  body {
    @apply bg-background text-gray-900 antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98];
  }

  .btn-secondary {
    @apply bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-secondary-500/25 hover:shadow-xl hover:shadow-secondary-500/30 active:scale-[0.98];
  }

  .btn-outline {
    @apply border-2 border-gray-200 hover:border-primary-500 hover:text-primary-500 font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.98];
  }

  .card {
    @apply bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md;
  }

  .badge {
    @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold;
  }

  .badge-new {
    @apply badge bg-secondary-100 text-secondary-700;
  }

  .badge-hot {
    @apply badge bg-primary-100 text-primary-700;
  }

  .badge-tonight {
    @apply badge bg-accent-100 text-accent-700;
  }

  .input {
    @apply w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-200;
  }
}
```

**Step 3: Create utility functions**

Create `lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateQRCode(): string {
  return `QR-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: setup Tailwind design system with brand colors and utilities"
```

---

### Task 3: Setup Supabase Client

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`

**Step 1: Create browser client**

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Create server client**

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

**Step 3: Create middleware helper**

Create `lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  return supabaseResponse;
}
```

**Step 4: Create middleware**

Create `middleware.ts` at project root:
```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: setup Supabase client for browser, server, and middleware"
```

---

### Task 4: Create Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Initialize Supabase locally**

Run:
```bash
npx supabase init
```

Expected: `supabase/` folder created

**Step 2: Create initial migration**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('user', 'organizer', 'admin');
CREATE TYPE user_plan AS ENUM ('free', 'pro', 'business');
CREATE TYPE venue_category AS ENUM ('bar', 'club', 'restaurant', 'theatre', 'gallery', 'concert_hall', 'other');
CREATE TYPE event_category AS ENUM ('concert', 'dj', 'theatre', 'comedy', 'expo', 'film', 'party', 'festival', 'other');
CREATE TYPE event_status AS ENUM ('draft', 'preview', 'published', 'cancelled', 'past');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'refunded', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('valid', 'used', 'resale', 'transferred', 'refunded');
CREATE TYPE gift_card_status AS ENUM ('active', 'used', 'expired');
CREATE TYPE collaborator_role AS ENUM ('admin', 'editor', 'staff');
CREATE TYPE email_template_type AS ENUM ('confirmation', 'reminder', 'day_of', 'cancellation');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  plan user_plan DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_connect_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venues
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category venue_category DEFAULT 'other',
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  cover_image TEXT,
  logo TEXT,
  social_links JSONB DEFAULT '{}',
  opening_hours JSONB DEFAULT '{}',
  amenities TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artists
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  image_url TEXT,
  genres TEXT[],
  spotify_id TEXT,
  apple_music_id TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category event_category DEFAULT 'other',
  music_genres TEXT[],
  cover_image TEXT,
  gallery TEXT[],
  video_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  doors_open TIMESTAMPTZ,
  status event_status DEFAULT 'draft',
  preview_token TEXT UNIQUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT TRUE,
  min_age INTEGER,
  dress_code TEXT,
  additional_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Artists (line-up)
CREATE TABLE public.event_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  set_time TIMESTAMPTZ,
  set_end_time TIMESTAMPTZ,
  stage TEXT,
  is_headliner BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(event_id, artist_id)
);

-- Ticket Types
CREATE TABLE public.ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity_total INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  max_per_order INTEGER DEFAULT 10,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  fees_amount DECIMAL(10, 2) DEFAULT 0,
  stripe_payment_intent TEXT,
  stripe_session_id TEXT,
  gift_card_id UUID,
  gift_card_amount DECIMAL(10, 2) DEFAULT 0,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  qr_code TEXT UNIQUE NOT NULL,
  status ticket_status DEFAULT 'valid',
  resale_price DECIMAL(10, 2),
  original_ticket_id UUID REFERENCES public.tickets(id),
  scanned_at TIMESTAMPTZ,
  scanned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift Cards
CREATE TABLE public.gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL,
  purchaser_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_email TEXT,
  recipient_name TEXT,
  sender_name TEXT,
  message TEXT,
  design_template TEXT DEFAULT 'default',
  status gift_card_status DEFAULT 'active',
  stripe_payment_intent TEXT,
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- Event Collaborators
CREATE TABLE public.event_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role collaborator_role DEFAULT 'staff',
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);

-- Email Templates
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type email_template_type NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo Codes
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  min_order_amount DECIMAL(10, 2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_venue ON public.events(venue_id);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_tickets_event ON public.tickets(event_id);
CREATE INDEX idx_tickets_user ON public.tickets(user_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_venues_city ON public.venues(city);
CREATE INDEX idx_venues_owner ON public.venues(owner_id);
CREATE INDEX idx_waitlist_event ON public.waitlist(event_id);

-- Full text search
CREATE INDEX idx_events_search ON public.events USING gin(to_tsvector('french', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_venues_search ON public.venues USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_artists_search ON public.artists USING gin(to_tsvector('french', name || ' ' || COALESCE(bio, '')));

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Venues: public can read published, owners can CRUD
CREATE POLICY "Published venues are viewable by everyone" ON public.venues FOR SELECT USING (is_published = true OR owner_id = auth.uid());
CREATE POLICY "Owners can insert venues" ON public.venues FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update venues" ON public.venues FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete venues" ON public.venues FOR DELETE USING (owner_id = auth.uid());

-- Events: public can read published/preview, organizers can CRUD
CREATE POLICY "Published events are viewable by everyone" ON public.events FOR SELECT USING (status IN ('published', 'past') OR organizer_id = auth.uid());
CREATE POLICY "Organizers can insert events" ON public.events FOR INSERT WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Organizers can update events" ON public.events FOR UPDATE USING (organizer_id = auth.uid());
CREATE POLICY "Organizers can delete events" ON public.events FOR DELETE USING (organizer_id = auth.uid());

-- Artists: anyone can read
CREATE POLICY "Artists are viewable by everyone" ON public.artists FOR SELECT USING (true);

-- Ticket types: public can read visible ones for published events
CREATE POLICY "Ticket types viewable for published events" ON public.ticket_types FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND status = 'published')
);

-- Orders: users can read own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Tickets: users can read own tickets, resale tickets are public
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (user_id = auth.uid() OR status = 'resale');
CREATE POLICY "Users can update own tickets" ON public.tickets FOR UPDATE USING (user_id = auth.uid());

-- Gift cards: owners can read own
CREATE POLICY "Users can view own gift cards" ON public.gift_cards FOR SELECT USING (purchaser_id = auth.uid());

-- Waitlist: users can manage own entries
CREATE POLICY "Users can view own waitlist" ON public.waitlist FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Users can leave waitlist" ON public.waitlist FOR DELETE USING (user_id = auth.uid());

-- Functions

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update ticket quantity sold
CREATE OR REPLACE FUNCTION update_ticket_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ticket_types
    SET quantity_sold = quantity_sold + 1
    WHERE id = NEW.ticket_type_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status != 'refunded' THEN
    UPDATE public.ticket_types
    SET quantity_sold = quantity_sold - 1
    WHERE id = OLD.ticket_type_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_quantity_trigger
  AFTER INSERT OR DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_ticket_quantity();
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add complete database schema with RLS policies"
```

---

### Task 5: Generate TypeScript Types from Database

**Files:**
- Create: `types/database.ts`

**Step 1: Generate types (manual version for now)**

Create `types/database.ts`:
```typescript
export type UserRole = "user" | "organizer" | "admin";
export type UserPlan = "free" | "pro" | "business";
export type VenueCategory = "bar" | "club" | "restaurant" | "theatre" | "gallery" | "concert_hall" | "other";
export type EventCategory = "concert" | "dj" | "theatre" | "comedy" | "expo" | "film" | "party" | "festival" | "other";
export type EventStatus = "draft" | "preview" | "published" | "cancelled" | "past";
export type OrderStatus = "pending" | "paid" | "refunded" | "cancelled";
export type TicketStatus = "valid" | "used" | "resale" | "transferred" | "refunded";
export type GiftCardStatus = "active" | "used" | "expired";
export type CollaboratorRole = "admin" | "editor" | "staff";
export type EmailTemplateType = "confirmation" | "reminder" | "day_of" | "cancellation";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  plan: UserPlan;
  stripe_customer_id: string | null;
  stripe_connect_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: VenueCategory;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  cover_image: string | null;
  logo: string | null;
  social_links: Record<string, string>;
  opening_hours: Record<string, string>;
  amenities: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  image_url: string | null;
  genres: string[];
  spotify_id: string | null;
  apple_music_id: string | null;
  social_links: Record<string, string>;
  created_at: string;
}

export interface Event {
  id: string;
  venue_id: string | null;
  organizer_id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category: EventCategory;
  music_genres: string[];
  cover_image: string | null;
  gallery: string[];
  video_url: string | null;
  start_date: string;
  end_date: string | null;
  doors_open: string | null;
  status: EventStatus;
  preview_token: string | null;
  is_featured: boolean;
  is_new: boolean;
  min_age: number | null;
  dress_code: string | null;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  venue?: Venue;
  organizer?: Profile;
  ticket_types?: TicketType[];
  event_artists?: (EventArtist & { artist: Artist })[];
}

export interface EventArtist {
  id: string;
  event_id: string;
  artist_id: string;
  set_time: string | null;
  set_end_time: string | null;
  stage: string | null;
  is_headliner: boolean;
  sort_order: number;
  artist?: Artist;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_total: number;
  quantity_sold: number;
  max_per_order: number;
  sale_start: string | null;
  sale_end: string | null;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  fees_amount: number;
  stripe_payment_intent: string | null;
  stripe_session_id: string | null;
  gift_card_id: string | null;
  gift_card_amount: number;
  customer_email: string;
  customer_name: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relations
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  order_id: string;
  ticket_type_id: string;
  event_id: string;
  user_id: string | null;
  qr_code: string;
  status: TicketStatus;
  resale_price: number | null;
  original_ticket_id: string | null;
  scanned_at: string | null;
  scanned_by: string | null;
  created_at: string;
  // Relations
  ticket_type?: TicketType;
  event?: Event;
}

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  purchaser_id: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  sender_name: string | null;
  message: string | null;
  design_template: string;
  status: GiftCardStatus;
  stripe_payment_intent: string | null;
  expires_at: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export interface Waitlist {
  id: string;
  event_id: string;
  user_id: string | null;
  email: string;
  ticket_type_id: string | null;
  quantity: number;
  notified: boolean;
  notified_at: string | null;
  created_at: string;
}

export interface EventCollaborator {
  id: string;
  event_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  user?: Profile;
}

export interface EmailTemplate {
  id: string;
  venue_id: string | null;
  organizer_id: string | null;
  type: EmailTemplateType;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  event_id: string | null;
  venue_id: string | null;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  min_order_amount: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

// Search and filter types
export interface EventFilters {
  query?: string;
  city?: string;
  category?: EventCategory;
  musicGenres?: string[];
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  isFree?: boolean;
  isTonight?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
}

export interface SearchResults<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Cart types
export interface CartItem {
  ticketTypeId: string;
  eventId: string;
  quantity: number;
  price: number;
  name: string;
  eventTitle: string;
  eventDate: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  giftCardCode?: string;
  giftCardDiscount?: number;
  promoCode?: string;
  promoDiscount?: number;
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add TypeScript types for database schema"
```

---

## Phase 2: UI Components

### Task 6: Create Base UI Components

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/avatar.tsx`
- Create: `components/ui/skeleton.tsx`

**Step 1: Create Button component**

Create `components/ui/button.tsx`:
```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
      primary: "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30",
      secondary: "bg-secondary-500 hover:bg-secondary-600 text-white shadow-lg shadow-secondary-500/25 hover:shadow-xl hover:shadow-secondary-500/30",
      outline: "border-2 border-gray-200 hover:border-primary-500 hover:text-primary-500 bg-transparent",
      ghost: "hover:bg-gray-100 bg-transparent",
      danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25",
    };

    const sizes = {
      sm: "text-sm px-4 py-2 gap-1.5",
      md: "text-base px-6 py-3 gap-2",
      lg: "text-lg px-8 py-4 gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {rightIcon && !isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
```

**Step 2: Create Input component**

Create `components/ui/input.tsx`:
```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white",
              "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none",
              "transition-all duration-200 placeholder:text-gray-400",
              leftIcon && "pl-12",
              rightIcon && "pr-12",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
```

**Step 3: Create Card component**

Create `components/ui/card.tsx`:
```tsx
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "elevated";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variants = {
    default: "bg-white rounded-2xl shadow-sm border border-gray-100",
    interactive: "bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer",
    elevated: "bg-white rounded-2xl shadow-lg border border-gray-100",
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
```

**Step 4: Create Badge component**

Create `components/ui/badge.tsx`:
```tsx
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "new" | "hot" | "tonight" | "soldout" | "featured";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    new: "bg-secondary-100 text-secondary-700",
    hot: "bg-primary-100 text-primary-700",
    tonight: "bg-accent-100 text-accent-700",
    soldout: "bg-gray-800 text-white",
    featured: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
```

**Step 5: Create Avatar component**

Create `components/ui/avatar.tsx`:
```tsx
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ className, src, alt = "", fallback, size = "md", ...props }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getFallback = () => {
    if (fallback) return fallback.slice(0, 2).toUpperCase();
    if (alt) return alt.slice(0, 2).toUpperCase();
    return "?";
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-semibold",
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      ) : (
        <span>{getFallback()}</span>
      )}
    </div>
  );
}
```

**Step 6: Create Skeleton component**

Create `components/ui/skeleton.tsx`:
```tsx
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const variants = {
    default: "rounded-xl",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
```

**Step 7: Create index export**

Create `components/ui/index.ts`:
```typescript
export * from "./button";
export * from "./input";
export * from "./card";
export * from "./badge";
export * from "./avatar";
export * from "./skeleton";
```

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add base UI components (Button, Input, Card, Badge, Avatar, Skeleton)"
```

---

### Task 7: Create Event Card Component

**Files:**
- Create: `components/features/event-card.tsx`

**Step 1: Create EventCard component**

Create `components/features/event-card.tsx`:
```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Euro } from "lucide-react";
import { motion } from "framer-motion";
import { Card, Badge } from "@/components/ui";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import type { Event } from "@/types/database";

interface EventCardProps {
  event: Event;
  variant?: "default" | "compact" | "featured";
}

export function EventCard({ event, variant = "default" }: EventCardProps) {
  const minPrice = event.ticket_types?.reduce(
    (min, t) => (t.price < min ? t.price : min),
    event.ticket_types[0]?.price ?? 0
  ) ?? 0;

  const isTonight = () => {
    const today = new Date();
    const eventDate = new Date(event.start_date);
    return (
      today.getDate() === eventDate.getDate() &&
      today.getMonth() === eventDate.getMonth() &&
      today.getFullYear() === eventDate.getFullYear()
    );
  };

  const isSoldOut = event.ticket_types?.every(
    (t) => t.quantity_sold >= t.quantity_total
  );

  if (variant === "compact") {
    return (
      <Link href={`/event/${event.slug}`}>
        <Card variant="interactive" className="flex gap-4 p-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={event.cover_image || "/placeholder-event.jpg"}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(event.start_date)}
            </p>
            <p className="text-sm font-semibold text-primary-500 mt-1">
              {minPrice === 0 ? "Gratuit" : `Dès ${formatPrice(minPrice)}`}
            </p>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/event/${event.slug}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card variant="interactive" className="relative overflow-hidden h-[400px]">
            <Image
              src={event.cover_image || "/placeholder-event.jpg"}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {event.is_featured && <Badge variant="featured">Coup de cœur</Badge>}
              {event.is_new && <Badge variant="new">Nouveau</Badge>}
              {isTonight() && <Badge variant="tonight">Ce soir</Badge>}
              {isSoldOut && <Badge variant="soldout">Complet</Badge>}
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(event.start_date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatTime(event.start_date)}
                </span>
                {event.venue && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {event.venue.name}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">
                  {minPrice === 0 ? "Gratuit" : `Dès ${formatPrice(minPrice)}`}
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                  Réserver
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/event/${event.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card variant="interactive" className="overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={event.cover_image || "/placeholder-event.jpg"}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {event.is_featured && <Badge variant="featured">❤️ Coup de cœur</Badge>}
              {event.is_new && <Badge variant="new">🆕 Nouveau</Badge>}
              {isTonight() && <Badge variant="tonight">🔥 Ce soir</Badge>}
              {isSoldOut && <Badge variant="soldout">Complet</Badge>}
            </div>
            {/* Price tag */}
            <div className="absolute bottom-3 right-3">
              <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-gray-900 shadow-lg">
                {minPrice === 0 ? "Gratuit" : formatPrice(minPrice)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
              {event.title}
            </h3>
            <div className="space-y-1.5 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                {formatDate(event.start_date)} • {formatTime(event.start_date)}
              </p>
              {event.venue && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  {event.venue.name}, {event.venue.city}
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add EventCard component with default, compact, and featured variants"
```

---

## Phase 3: Layout & Navigation

### Task 8: Create Layout Components

**Files:**
- Create: `components/layout/header.tsx`
- Create: `components/layout/footer.tsx`
- Create: `components/layout/mobile-nav.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create Header component**

Create `components/layout/header.tsx`:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, ShoppingBag, Heart } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/search", label: "Explorer" },
  { href: "/resale", label: "Revente" },
  { href: "/gift-cards", label: "Cartes cadeaux" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null); // TODO: Get from auth

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">Events</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary-500 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search button */}
            <Link href="/search">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="w-5 h-5" />
              </Button>
            </Link>

            {/* Favorites */}
            <Button variant="ghost" size="sm" className="relative">
              <Heart className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </Button>

            {/* User menu */}
            {user ? (
              <Avatar
                src={user.avatar_url}
                alt={user.full_name}
                fallback={user.full_name}
                size="sm"
                className="cursor-pointer"
              />
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Connexion
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    pathname === link.href
                      ? "text-primary-500 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
```

**Step 2: Create Footer component**

Create `components/layout/footer.tsx`:
```tsx
import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";

const footerLinks = {
  discover: [
    { href: "/search", label: "Explorer" },
    { href: "/search?category=concert", label: "Concerts" },
    { href: "/search?category=dj", label: "Clubs & DJ" },
    { href: "/search?category=theatre", label: "Théâtre" },
    { href: "/search?category=expo", label: "Expositions" },
  ],
  services: [
    { href: "/resale", label: "Revente de billets" },
    { href: "/gift-cards", label: "Cartes cadeaux" },
    { href: "/for-organizers", label: "Pour les organisateurs" },
    { href: "/pricing", label: "Tarifs" },
  ],
  support: [
    { href: "/help", label: "Centre d'aide" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  legal: [
    { href: "/terms", label: "CGU" },
    { href: "/privacy", label: "Confidentialité" },
    { href: "/cookies", label: "Cookies" },
  ],
};

const socialLinks = [
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="font-bold text-xl">Events</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Découvrez les meilleurs événements près de chez vous.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-semibold mb-4">Découvrir</h4>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Légal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Events. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
```

**Step 3: Update root layout**

Modify `app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Events - Découvrez les meilleurs événements",
  description: "Billetterie en ligne pour concerts, clubs, théâtre, expositions et plus encore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add Header and Footer layout components"
```

---

## Next Phases (Summary)

### Phase 4: Authentication
- Task 9: Auth forms (login, register)
- Task 10: Auth hooks and context
- Task 11: Protected routes

### Phase 5: Home Page
- Task 12: Hero section with search
- Task 13: Event sections (tonight, featured, new)
- Task 14: Category carousel

### Phase 6: Search & Discovery
- Task 15: Search page with filters
- Task 16: Map integration
- Task 17: Event list with pagination

### Phase 7: Event Detail Page
- Task 18: Event header and info
- Task 19: Ticket selector
- Task 20: Artist lineup with Spotify

### Phase 8: Cart & Checkout
- Task 21: Cart store (Zustand)
- Task 22: Cart drawer
- Task 23: Checkout flow
- Task 24: Stripe integration

### Phase 9: Resale & Gift Cards
- Task 25: Resale marketplace
- Task 26: Gift card purchase
- Task 27: Gift card redemption

### Phase 10: Dashboard
- Task 28: Dashboard layout
- Task 29: Event management CRUD
- Task 30: Analytics charts
- Task 31: Team management

### Phase 11: Polish
- Task 32: Loading states
- Task 33: Error handling
- Task 34: SEO optimization
- Task 35: Performance optimization

---

**Plan complete and saved to `docs/plans/2025-02-04-events-implementation-plan.md`.**

**Two execution options:**

1. **Subagent-Driven (this session)** - Je dispatch un agent par tâche, review entre chaque, itération rapide

2. **Parallel Session (separate)** - Nouvelle session avec executing-plans, exécution par batch avec checkpoints

**Quelle approche ?**
