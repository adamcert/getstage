// =============================================================================
// ENUMS
// =============================================================================

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

// =============================================================================
// INTERFACES - Database Tables
// =============================================================================

/**
 * User profile - extends Supabase auth.users
 */
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

/**
 * Venue - location where events take place
 */
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

/**
 * Artist - performer or act at events
 */
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

/**
 * Event - main event entity
 */
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
  // Relations (optional, populated via joins)
  venue?: Venue;
  organizer?: Profile;
  ticket_types?: TicketType[];
  event_artists?: (EventArtist & { artist: Artist })[];
}

/**
 * EventArtist - junction table for event line-up
 */
export interface EventArtist {
  id: string;
  event_id: string;
  artist_id: string;
  set_time: string | null;
  set_end_time: string | null;
  stage: string | null;
  is_headliner: boolean;
  sort_order: number;
  // Relations (optional)
  artist?: Artist;
}

/**
 * TicketType - different ticket tiers for an event
 */
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

/**
 * Order - purchase transaction
 */
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
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Relations (optional)
  tickets?: Ticket[];
}

/**
 * Ticket - individual ticket instance
 */
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
  // Relations (optional)
  ticket_type?: TicketType;
  event?: Event;
}

/**
 * GiftCard - prepaid gift card
 */
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

/**
 * Waitlist - users waiting for ticket availability
 */
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

/**
 * EventCollaborator - team members with access to event management
 */
export interface EventCollaborator {
  id: string;
  event_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  // Relations (optional)
  user?: Profile;
}

/**
 * EmailTemplate - customizable email templates
 */
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

/**
 * PromoCode - discount codes for events/venues
 */
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

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * EventFilters - query parameters for event search
 */
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

/**
 * SearchResults - paginated search response
 */
export interface SearchResults<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * CartItem - single item in shopping cart
 */
export interface CartItem {
  ticketTypeId: string;
  eventId: string;
  quantity: number;
  price: number;
  name: string;
  eventTitle: string;
  eventDate: string;
}

/**
 * Cart - shopping cart state
 */
export interface Cart {
  items: CartItem[];
  total: number;
  giftCardCode?: string;
  giftCardDiscount?: number;
  promoCode?: string;
  promoDiscount?: number;
}
