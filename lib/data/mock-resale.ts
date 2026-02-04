import type { Event, Ticket, TicketType, Profile, EventCategory } from "@/types/database";
import { mockEvents } from "./mock-events";

// =============================================================================
// RESALE TICKET TYPE
// =============================================================================

export interface ResaleTicket {
  id: string;
  ticket: Ticket;
  ticketType: TicketType;
  event: Event;
  seller: Pick<Profile, "id" | "full_name" | "avatar_url">;
  originalPrice: number;
  resalePrice: number;
  listedAt: string;
}

// =============================================================================
// MOCK SELLERS
// =============================================================================

const mockSellers: Pick<Profile, "id" | "full_name" | "avatar_url">[] = [
  {
    id: "seller-1",
    full_name: "Marie D.",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    id: "seller-2",
    full_name: "Thomas L.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    id: "seller-3",
    full_name: "Julie M.",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
  },
  {
    id: "seller-4",
    full_name: "Alexandre P.",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  },
  {
    id: "seller-5",
    full_name: "Sophie B.",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
  },
  {
    id: "seller-6",
    full_name: "Nicolas R.",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
  },
];

// =============================================================================
// HELPER FUNCTION
// =============================================================================

function getRelativeDate(daysOffset: number, hour: number = 10, minute: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// =============================================================================
// MOCK RESALE TICKETS
// =============================================================================

export const mockResaleTickets: ResaleTicket[] = [
  // Ticket 1 - Techno Night w/ Amelie Lens - VIP with discount
  {
    id: "resale-1",
    ticket: {
      id: "ticket-resale-1",
      order_id: "order-123",
      ticket_type_id: "ticket-event-1-2",
      event_id: "event-1",
      user_id: "seller-1",
      qr_code: "QR-RESALE-001",
      status: "resale",
      resale_price: 45,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-10),
    },
    ticketType: {
      id: "ticket-event-1-2",
      event_id: "event-1",
      name: "VIP",
      description: "Acces VIP avec coupe de champagne",
      price: 50,
      quantity_total: 50,
      quantity_sold: 30,
      max_per_order: 4,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 2,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-1")!,
    seller: mockSellers[0],
    originalPrice: 50,
    resalePrice: 45,
    listedAt: getRelativeDate(-2),
  },
  // Ticket 2 - Phoenix en Concert - Fosse at original price
  {
    id: "resale-2",
    ticket: {
      id: "ticket-resale-2",
      order_id: "order-124",
      ticket_type_id: "ticket-event-2-0",
      event_id: "event-2",
      user_id: "seller-2",
      qr_code: "QR-RESALE-002",
      status: "resale",
      resale_price: 45,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-8),
    },
    ticketType: {
      id: "ticket-event-2-0",
      event_id: "event-2",
      name: "Fosse",
      description: "Place debout en fosse",
      price: 45,
      quantity_total: 800,
      quantity_sold: 800,
      max_per_order: 6,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 0,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-2")!,
    seller: mockSellers[1],
    originalPrice: 45,
    resalePrice: 45,
    listedAt: getRelativeDate(-1),
  },
  // Ticket 3 - Le Roi Lion - Categorie 1 with discount
  {
    id: "resale-3",
    ticket: {
      id: "ticket-resale-3",
      order_id: "order-125",
      ticket_type_id: "ticket-event-5-2",
      event_id: "event-5",
      user_id: "seller-3",
      qr_code: "QR-RESALE-003",
      status: "resale",
      resale_price: 99,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-15),
    },
    ticketType: {
      id: "ticket-event-5-2",
      event_id: "event-5",
      name: "Categorie 1",
      description: "Meilleures places orchestre",
      price: 119,
      quantity_total: 100,
      quantity_sold: 95,
      max_per_order: 4,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 2,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-5")!,
    seller: mockSellers[2],
    originalPrice: 119,
    resalePrice: 99,
    listedAt: getRelativeDate(-3),
  },
  // Ticket 4 - Stromae - Tribune
  {
    id: "resale-4",
    ticket: {
      id: "ticket-resale-4",
      order_id: "order-126",
      ticket_type_id: "ticket-event-6-1",
      event_id: "event-6",
      user_id: "seller-4",
      qr_code: "QR-RESALE-004",
      status: "resale",
      resale_price: 42,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-5),
    },
    ticketType: {
      id: "ticket-event-6-1",
      event_id: "event-6",
      name: "Tribune",
      description: "Place assise en tribune",
      price: 49,
      quantity_total: 3000,
      quantity_sold: 2800,
      max_per_order: 6,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 1,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-6")!,
    seller: mockSellers[3],
    originalPrice: 49,
    resalePrice: 42,
    listedAt: getRelativeDate(-1),
  },
  // Ticket 5 - House Music Marathon - Pass 24h
  {
    id: "resale-5",
    ticket: {
      id: "ticket-resale-5",
      order_id: "order-127",
      ticket_type_id: "ticket-event-4-1",
      event_id: "event-4",
      user_id: "seller-5",
      qr_code: "QR-RESALE-005",
      status: "resale",
      resale_price: 40,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-7),
    },
    ticketType: {
      id: "ticket-event-4-1",
      event_id: "event-4",
      name: "Pass 24h",
      description: "Acces complet pendant 24h",
      price: 45,
      quantity_total: 200,
      quantity_sold: 180,
      max_per_order: 4,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 1,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-4")!,
    seller: mockSellers[4],
    originalPrice: 45,
    resalePrice: 40,
    listedAt: getRelativeDate(-2),
  },
  // Ticket 6 - Angele - Orchestre
  {
    id: "resale-6",
    ticket: {
      id: "ticket-resale-6",
      order_id: "order-128",
      ticket_type_id: "ticket-event-7-0",
      event_id: "event-7",
      user_id: "seller-6",
      qr_code: "QR-RESALE-006",
      status: "resale",
      resale_price: 50,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-4),
    },
    ticketType: {
      id: "ticket-event-7-0",
      event_id: "event-7",
      name: "Orchestre",
      description: "Place en orchestre",
      price: 55,
      quantity_total: 500,
      quantity_sold: 200,
      max_per_order: 6,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 0,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-7")!,
    seller: mockSellers[0],
    originalPrice: 55,
    resalePrice: 50,
    listedAt: getRelativeDate(0),
  },
  // Ticket 7 - Festival Electro Week - Pass 3 Jours
  {
    id: "resale-7",
    ticket: {
      id: "ticket-resale-7",
      order_id: "order-129",
      ticket_type_id: "ticket-event-13-1",
      event_id: "event-13",
      user_id: "seller-1",
      qr_code: "QR-RESALE-007",
      status: "resale",
      resale_price: 85,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-12),
    },
    ticketType: {
      id: "ticket-event-13-1",
      event_id: "event-13",
      name: "Pass 3 Jours",
      description: "Acces aux 3 jours du festival",
      price: 99,
      quantity_total: 1500,
      quantity_sold: 1100,
      max_per_order: 4,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 1,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-13")!,
    seller: mockSellers[0],
    originalPrice: 99,
    resalePrice: 85,
    listedAt: getRelativeDate(-4),
  },
  // Ticket 8 - Jazz Night Ibrahim Maalouf - Premium
  {
    id: "resale-8",
    ticket: {
      id: "ticket-resale-8",
      order_id: "order-130",
      ticket_type_id: "ticket-event-14-2",
      event_id: "event-14",
      user_id: "seller-2",
      qr_code: "QR-RESALE-008",
      status: "resale",
      resale_price: 65,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-6),
    },
    ticketType: {
      id: "ticket-event-14-2",
      event_id: "event-14",
      name: "Premium",
      description: "Meilleures places avec acces backstage",
      price: 75,
      quantity_total: 100,
      quantity_sold: 90,
      max_per_order: 4,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 2,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-14")!,
    seller: mockSellers[1],
    originalPrice: 75,
    resalePrice: 65,
    listedAt: getRelativeDate(-1),
  },
  // Ticket 9 - Drumcode Night - Regular
  {
    id: "resale-9",
    ticket: {
      id: "ticket-resale-9",
      order_id: "order-131",
      ticket_type_id: "ticket-event-8-1",
      event_id: "event-8",
      user_id: "seller-3",
      qr_code: "QR-RESALE-009",
      status: "resale",
      resale_price: 25,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-3),
    },
    ticketType: {
      id: "ticket-event-8-1",
      event_id: "event-8",
      name: "Regular",
      description: "Entree standard",
      price: 28,
      quantity_total: 250,
      quantity_sold: 30,
      max_per_order: 6,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 1,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-8")!,
    seller: mockSellers[2],
    originalPrice: 28,
    resalePrice: 25,
    listedAt: getRelativeDate(0),
  },
  // Ticket 10 - Ibeyi Live - Debout
  {
    id: "resale-10",
    ticket: {
      id: "ticket-resale-10",
      order_id: "order-132",
      ticket_type_id: "ticket-event-11-0",
      event_id: "event-11",
      user_id: "seller-4",
      qr_code: "QR-RESALE-010",
      status: "resale",
      resale_price: 30,
      original_ticket_id: null,
      scanned_at: null,
      scanned_by: null,
      created_at: getRelativeDate(-8),
    },
    ticketType: {
      id: "ticket-event-11-0",
      event_id: "event-11",
      name: "Debout",
      description: "Place debout",
      price: 35,
      quantity_total: 600,
      quantity_sold: 150,
      max_per_order: 6,
      sale_start: null,
      sale_end: null,
      is_visible: true,
      sort_order: 0,
      created_at: getRelativeDate(-30),
    },
    event: mockEvents.find(e => e.id === "event-11")!,
    seller: mockSellers[3],
    originalPrice: 35,
    resalePrice: 30,
    listedAt: getRelativeDate(-2),
  },
];

// =============================================================================
// HELPER FUNCTIONS FOR FILTERING
// =============================================================================

/**
 * Get all resale tickets
 */
export function getResaleTickets(): ResaleTicket[] {
  return mockResaleTickets;
}

/**
 * Get resale ticket by ID
 */
export function getResaleTicketById(id: string): ResaleTicket | undefined {
  return mockResaleTickets.find((ticket) => ticket.id === id);
}

/**
 * Filter resale tickets by event category
 */
export function getResaleTicketsByCategory(category: EventCategory): ResaleTicket[] {
  return mockResaleTickets.filter((ticket) => ticket.event.category === category);
}

/**
 * Filter resale tickets by max price
 */
export function getResaleTicketsByMaxPrice(maxPrice: number): ResaleTicket[] {
  return mockResaleTickets.filter((ticket) => ticket.resalePrice <= maxPrice);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: number, resalePrice: number): number {
  if (originalPrice <= 0) return 0;
  const discount = ((originalPrice - resalePrice) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * Get unique categories from resale tickets
 */
export function getResaleCategories(): EventCategory[] {
  const categories = mockResaleTickets.map((ticket) => ticket.event.category);
  return [...new Set(categories)];
}
