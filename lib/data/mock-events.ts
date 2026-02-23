import type { Event, Venue, TicketType, EventCategory, Artist, EventArtist } from "@/types/database";

// =============================================================================
// MOCK VENUES
// =============================================================================

const venues: Record<string, Venue> = {
  "le-rex-club": {
    id: "venue-1",
    owner_id: "owner-1",
    name: "Le Rex Club",
    slug: "le-rex-club",
    description: "Legendary Parisian club since 1988",
    category: "club",
    address: "5 Boulevard Poissonniere",
    city: "Paris",
    postal_code: "75002",
    country: "France",
    latitude: 48.8717,
    longitude: 2.3472,
    phone: "+33 1 42 36 10 96",
    website: "https://rexclub.com",
    cover_image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800",
    logo: null,
    social_links: {},
    opening_hours: {},
    amenities: ["cloakroom", "smoking area"],
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  "olympia": {
    id: "venue-2",
    owner_id: "owner-2",
    name: "L'Olympia",
    slug: "olympia",
    description: "Legendary concert hall",
    category: "concert_hall",
    address: "28 Boulevard des Capucines",
    city: "Paris",
    postal_code: "75009",
    country: "France",
    latitude: 48.8706,
    longitude: 2.3283,
    phone: "+33 1 47 42 25 49",
    website: "https://olympiahall.com",
    cover_image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
    logo: null,
    social_links: {},
    opening_hours: {},
    amenities: ["bar", "cloakroom", "accessibility"],
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  "theatre-mogador": {
    id: "venue-3",
    owner_id: "owner-3",
    name: "Theatre Mogador",
    slug: "theatre-mogador",
    description: "Historic Paris theatre",
    category: "theatre",
    address: "25 Rue de Mogador",
    city: "Paris",
    postal_code: "75009",
    country: "France",
    latitude: 48.8754,
    longitude: 2.3287,
    phone: "+33 1 53 33 45 00",
    website: "https://theatremogador.com",
    cover_image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800",
    logo: null,
    social_links: {},
    opening_hours: {},
    amenities: ["bar", "cloakroom", "accessibility"],
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  "le-bataclan": {
    id: "venue-4",
    owner_id: "owner-4",
    name: "Le Bataclan",
    slug: "le-bataclan",
    description: "Concert and show venue",
    category: "concert_hall",
    address: "50 Boulevard Voltaire",
    city: "Paris",
    postal_code: "75011",
    country: "France",
    latitude: 48.8632,
    longitude: 2.3706,
    phone: "+33 1 43 14 00 30",
    website: "https://bataclan.fr",
    cover_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    logo: null,
    social_links: {},
    opening_hours: {},
    amenities: ["bar", "cloakroom"],
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  "concrete": {
    id: "venue-5",
    owner_id: "owner-5",
    name: "Concrete",
    slug: "concrete",
    description: "Club on a barge",
    category: "club",
    address: "Port de la Rapee",
    city: "Paris",
    postal_code: "75012",
    country: "France",
    latitude: 48.8459,
    longitude: 2.3670,
    phone: null,
    website: "https://concrete.paris",
    cover_image: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800",
    logo: null,
    social_links: {},
    opening_hours: {},
    amenities: ["terrace", "smoking area"],
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  "zenith-paris": {
    id: "venue-6",
    owner_id: "owner-6",
    name: "Zenith Paris",
    slug: "zenith-paris",
    description: "Large concert hall",
    category: "concert_hall",
    address: "211 Avenue Jean Jaures",
    city: "Paris",
    postal_code: "75019",
    country: "France",
    latitude: 48.8936,
    longitude: 2.3930,
    phone: "+33 1 44 52 54 56",
    website: "https://zenith-paris.com",
    cover_image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    logo: null,
    social_links: {},
    opening_hours: {},
    amenities: ["bar", "cloakroom", "parking", "accessibility"],
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  "comedy-club": {
    id: "venue-7",
    owner_id: "owner-7",
    name: "Le Comedy Club",
    slug: "comedy-club",
    description: "Temple of Parisian comedy",
    category: "theatre",
    address: "42 Boulevard de Bonne Nouvelle",
    city: "Paris",
    postal_code: "75010",
    country: "France",
    latitude: 48.8704,
    longitude: 2.3510,
    phone: "+33 1 42 36 00 00",
    website: "https://comedyclub.fr",
    cover_image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
    logo: null,
    social_links: {},
    opening_hours: {},
    amenities: ["bar"],
    is_published: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
};

// =============================================================================
// MOCK ARTISTS
// =============================================================================

export const mockArtists: Record<string, Artist> = {
  "amelie-lens": {
    id: "artist-1",
    name: "Amelie Lens",
    slug: "amelie-lens",
    bio: "Belgian techno DJ and producer, major figure in the global electronic music scene.",
    image_url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
    genres: ["techno", "acid techno"],
    spotify_id: "7kOrrFIHDh2k8WSOBN0Spe",
    apple_music_id: null,
    social_links: { instagram: "amelikiralens", twitter: "AmelieLens" },
    created_at: "2024-01-01T00:00:00Z",
  },
  "charlotte-de-witte": {
    id: "artist-2",
    name: "Charlotte de Witte",
    slug: "charlotte-de-witte",
    bio: "Belgian techno DJ and producer, founder of the KNTXT label.",
    image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    genres: ["techno", "hard techno"],
    spotify_id: "1WHaGjLmxuXl3NZTLo7PxL",
    apple_music_id: null,
    social_links: { instagram: "charlottedewittemusic" },
    created_at: "2024-01-01T00:00:00Z",
  },
  "adam-beyer": {
    id: "artist-3",
    name: "Adam Beyer",
    slug: "adam-beyer",
    bio: "Pioneer of Swedish techno, founder of Drumcode Records.",
    image_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400",
    genres: ["techno"],
    spotify_id: "0UxGGEugDyTXKl9DFpG8UL",
    apple_music_id: null,
    social_links: { instagram: "realadambeyer" },
    created_at: "2024-01-01T00:00:00Z",
  },
  "phoenix": {
    id: "artist-4",
    name: "Phoenix",
    slug: "phoenix",
    bio: "French alternative rock band formed in Versailles in 1999.",
    image_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400",
    genres: ["indie", "pop", "rock"],
    spotify_id: "1xU878Z1QtBldR7ru9owdU",
    apple_music_id: null,
    social_links: { instagram: "wearephoenix" },
    created_at: "2024-01-01T00:00:00Z",
  },
  "stromae": {
    id: "artist-5",
    name: "Stromae",
    slug: "stromae",
    bio: "Belgian singer-songwriter, figure in electronic and hip-hop music.",
    image_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400",
    genres: ["pop", "electronic", "hip-hop"],
    spotify_id: "4NHQUGzhtTLFvgF5SZesLK",
    apple_music_id: null,
    social_links: { instagram: "stromae" },
    created_at: "2024-01-01T00:00:00Z",
  },
  "angele": {
    id: "artist-6",
    name: "Angele",
    slug: "angele",
    bio: "Belgian singer and musician, pop revelation of her generation.",
    image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
    genres: ["pop", "electro-pop"],
    spotify_id: "3QVolfxWIXNsiUG2GXqNXY",
    apple_music_id: null,
    social_links: { instagram: "angele_vl" },
    created_at: "2024-01-01T00:00:00Z",
  },
  "ibrahim-maalouf": {
    id: "artist-7",
    name: "Ibrahim Maalouf",
    slug: "ibrahim-maalouf",
    bio: "Franco-Lebanese virtuoso trumpeter, pioneer of oriental jazz fusion.",
    image_url: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400",
    genres: ["jazz", "world", "fusion"],
    spotify_id: "6pK1uO1QDNxjdqVc4fvLhT",
    apple_music_id: null,
    social_links: { instagram: "ibrahim_maalouf" },
    created_at: "2024-01-01T00:00:00Z",
  },
  "ibeyi": {
    id: "artist-8",
    name: "Ibeyi",
    slug: "ibeyi",
    bio: "Franco-Cuban duo composed of twins Lisa-Kainde and Naomi Diaz.",
    image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    genres: ["soul", "afro-cuban", "electronic"],
    spotify_id: "0b3SaQsGl3ql6QQ3w2xmWJ",
    apple_music_id: null,
    social_links: { instagram: "ibeyi" },
    created_at: "2024-01-01T00:00:00Z",
  },
};

// =============================================================================
// MOCK EVENT ARTISTS (Lineups)
// =============================================================================

export const mockEventArtists: Record<string, (EventArtist & { artist: Artist })[]> = {
  "event-1": [
    {
      id: "ea-1-1",
      event_id: "event-1",
      artist_id: "artist-1",
      set_time: null,
      set_end_time: null,
      stage: "Main",
      is_headliner: true,
      sort_order: 0,
      artist: mockArtists["amelie-lens"],
    },
    {
      id: "ea-1-2",
      event_id: "event-1",
      artist_id: "artist-2",
      set_time: null,
      set_end_time: null,
      stage: "Main",
      is_headliner: false,
      sort_order: 1,
      artist: mockArtists["charlotte-de-witte"],
    },
  ],
  "event-2": [
    {
      id: "ea-2-1",
      event_id: "event-2",
      artist_id: "artist-4",
      set_time: null,
      set_end_time: null,
      stage: null,
      is_headliner: true,
      sort_order: 0,
      artist: mockArtists["phoenix"],
    },
  ],
  "event-6": [
    {
      id: "ea-6-1",
      event_id: "event-6",
      artist_id: "artist-5",
      set_time: null,
      set_end_time: null,
      stage: null,
      is_headliner: true,
      sort_order: 0,
      artist: mockArtists["stromae"],
    },
  ],
  "event-7": [
    {
      id: "ea-7-1",
      event_id: "event-7",
      artist_id: "artist-6",
      set_time: null,
      set_end_time: null,
      stage: null,
      is_headliner: true,
      sort_order: 0,
      artist: mockArtists["angele"],
    },
  ],
  "event-8": [
    {
      id: "ea-8-1",
      event_id: "event-8",
      artist_id: "artist-3",
      set_time: null,
      set_end_time: null,
      stage: "Main",
      is_headliner: true,
      sort_order: 0,
      artist: mockArtists["adam-beyer"],
    },
    {
      id: "ea-8-2",
      event_id: "event-8",
      artist_id: "artist-2",
      set_time: null,
      set_end_time: null,
      stage: "Main",
      is_headliner: false,
      sort_order: 1,
      artist: mockArtists["charlotte-de-witte"],
    },
  ],
  "event-11": [
    {
      id: "ea-11-1",
      event_id: "event-11",
      artist_id: "artist-8",
      set_time: null,
      set_end_time: null,
      stage: null,
      is_headliner: true,
      sort_order: 0,
      artist: mockArtists["ibeyi"],
    },
  ],
  "event-14": [
    {
      id: "ea-14-1",
      event_id: "event-14",
      artist_id: "artist-7",
      set_time: null,
      set_end_time: null,
      stage: null,
      is_headliner: true,
      sort_order: 0,
      artist: mockArtists["ibrahim-maalouf"],
    },
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a date relative to today
 * @param daysOffset - Number of days from today (0 = today, 1 = tomorrow, etc.)
 * @param hour - Hour of the day (24h format)
 * @param minute - Minute
 */
function getRelativeDate(daysOffset: number, hour: number = 20, minute: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/**
 * Create ticket types for an event
 */
function createTicketTypes(
  eventId: string,
  prices: { name: string; price: number; quantity: number; sold?: number }[]
): TicketType[] {
  return prices.map((p, index) => ({
    id: `ticket-${eventId}-${index}`,
    event_id: eventId,
    name: p.name,
    description: null,
    price: p.price,
    quantity_total: p.quantity,
    quantity_sold: p.sold ?? 0,
    max_per_order: 6,
    sale_start: null,
    sale_end: null,
    is_visible: true,
    sort_order: index,
    created_at: "2024-01-01T00:00:00Z",
  }));
}

// =============================================================================
// MOCK EVENTS
// =============================================================================

export const mockEvents: Event[] = [
  // ==========================================================================
  // TONIGHT - Tonight's events
  // ==========================================================================
  {
    id: "event-1",
    venue_id: "venue-1",
    organizer_id: "org-1",
    title: "Techno Night w/ Amelie Lens",
    slug: "techno-night-amelie-lens",
    description: "A night of techno with Belgian DJ Amelie Lens",
    short_description: "Exceptional techno night",
    category: "dj" as EventCategory,
    music_genres: ["techno", "acid"],
    cover_image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(0, 23, 0),
    end_date: getRelativeDate(1, 6, 0),
    doors_open: getRelativeDate(0, 23, 0),
    status: "published",
    preview_token: null,
    is_featured: true,
    is_new: false,
    min_age: 18,
    dress_code: "Casual chic",
    additional_info: null,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
    venue: venues["le-rex-club"],
    ticket_types: createTicketTypes("event-1", [
      { name: "Early Bird", price: 15, quantity: 100, sold: 100 },
      { name: "Normal", price: 25, quantity: 300, sold: 250 },
      { name: "VIP", price: 50, quantity: 50, sold: 30 },
    ]),
  },
  {
    id: "event-2",
    venue_id: "venue-4",
    organizer_id: "org-2",
    title: "Phoenix in Concert",
    slug: "phoenix-concert",
    description: "French band Phoenix back on stage",
    short_description: "Must-see concert event",
    category: "concert" as EventCategory,
    music_genres: ["indie", "pop", "rock"],
    cover_image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(0, 20, 30),
    end_date: getRelativeDate(0, 23, 30),
    doors_open: getRelativeDate(0, 19, 30),
    status: "published",
    preview_token: null,
    is_featured: true,
    is_new: false,
    min_age: null,
    dress_code: null,
    additional_info: null,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
    venue: venues["le-bataclan"],
    ticket_types: createTicketTypes("event-2", [
      { name: "Pit", price: 45, quantity: 800, sold: 800 },
      { name: "Balcony", price: 55, quantity: 200, sold: 200 },
    ]),
  },
  {
    id: "event-3",
    venue_id: "venue-7",
    organizer_id: "org-3",
    title: "Stand-Up Comedy Night",
    slug: "stand-up-comedy-night",
    description: "The best French comedians on stage",
    short_description: "Comedy night with 5 comedians",
    category: "comedy" as EventCategory,
    music_genres: [],
    cover_image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(0, 21, 0),
    end_date: getRelativeDate(0, 23, 0),
    doors_open: getRelativeDate(0, 20, 30),
    status: "published",
    preview_token: null,
    is_featured: false,
    is_new: true,
    min_age: 16,
    dress_code: null,
    additional_info: null,
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
    venue: venues["comedy-club"],
    ticket_types: createTicketTypes("event-3", [
      { name: "Standard Seat", price: 18, quantity: 150, sold: 80 },
    ]),
  },

  // ==========================================================================
  // THIS WEEK - This week's events
  // ==========================================================================
  {
    id: "event-4",
    venue_id: "venue-5",
    organizer_id: "org-4",
    title: "House Music Marathon",
    slug: "house-music-marathon",
    description: "24h of non-stop house music on the Seine",
    short_description: "House marathon on a barge",
    category: "dj" as EventCategory,
    music_genres: ["house", "deep house", "disco"],
    cover_image: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(2, 18, 0),
    end_date: getRelativeDate(3, 18, 0),
    doors_open: getRelativeDate(2, 18, 0),
    status: "published",
    preview_token: null,
    is_featured: true,
    is_new: false,
    min_age: 18,
    dress_code: null,
    additional_info: null,
    created_at: "2024-01-12T00:00:00Z",
    updated_at: "2024-01-12T00:00:00Z",
    venue: venues["concrete"],
    ticket_types: createTicketTypes("event-4", [
      { name: "Day Pass", price: 30, quantity: 400, sold: 320 },
      { name: "Pass 24h", price: 45, quantity: 200, sold: 180 },
    ]),
  },
  {
    id: "event-5",
    venue_id: "venue-3",
    organizer_id: "org-5",
    title: "The Lion King - The Musical",
    slug: "roi-lion-comedie-musicale",
    description: "The must-see Disney show",
    short_description: "The Disney classic on stage",
    category: "theatre" as EventCategory,
    music_genres: [],
    cover_image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(3, 20, 0),
    end_date: getRelativeDate(3, 22, 30),
    doors_open: getRelativeDate(3, 19, 30),
    status: "published",
    preview_token: null,
    is_featured: true,
    is_new: false,
    min_age: null,
    dress_code: null,
    additional_info: null,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z",
    venue: venues["theatre-mogador"],
    ticket_types: createTicketTypes("event-5", [
      { name: "Category 3", price: 49, quantity: 300, sold: 200 },
      { name: "Category 2", price: 79, quantity: 200, sold: 150 },
      { name: "Category 1", price: 119, quantity: 100, sold: 95 },
      { name: "Gold Square", price: 149, quantity: 50, sold: 50 },
    ]),
  },
  {
    id: "event-6",
    venue_id: "venue-6",
    organizer_id: "org-6",
    title: "Stromae - Multitude Tour",
    slug: "stromae-multitude-tour",
    description: "Stromae's return with his new album",
    short_description: "Stromae at the Zenith Paris",
    category: "concert" as EventCategory,
    music_genres: ["pop", "electronic", "hip-hop"],
    cover_image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(5, 20, 0),
    end_date: getRelativeDate(5, 23, 0),
    doors_open: getRelativeDate(5, 19, 0),
    status: "published",
    preview_token: null,
    is_featured: true,
    is_new: false,
    min_age: null,
    dress_code: null,
    additional_info: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    venue: venues["zenith-paris"],
    ticket_types: createTicketTypes("event-6", [
      { name: "Pit", price: 59, quantity: 3000, sold: 3000 },
      { name: "Stand", price: 49, quantity: 3000, sold: 2800 },
    ]),
  },

  // ==========================================================================
  // NEW - New events
  // ==========================================================================
  {
    id: "event-7",
    venue_id: "venue-2",
    organizer_id: "org-7",
    title: "Angele - Nonante-Cinq Tour",
    slug: "angele-nonante-cinq",
    description: "The Belgian singer on tour",
    short_description: "Angele at L'Olympia",
    category: "concert" as EventCategory,
    music_genres: ["pop", "electro-pop"],
    cover_image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(10, 20, 30),
    end_date: getRelativeDate(10, 23, 0),
    doors_open: getRelativeDate(10, 19, 30),
    status: "published",
    preview_token: null,
    is_featured: false,
    is_new: true,
    min_age: null,
    dress_code: null,
    additional_info: null,
    created_at: getRelativeDate(-1),
    updated_at: getRelativeDate(-1),
    venue: venues["olympia"],
    ticket_types: createTicketTypes("event-7", [
      { name: "Orchestra", price: 55, quantity: 500, sold: 200 },
      { name: "Balcony", price: 45, quantity: 400, sold: 100 },
    ]),
  },
  {
    id: "event-8",
    venue_id: "venue-1",
    organizer_id: "org-8",
    title: "Drumcode Night",
    slug: "drumcode-night",
    description: "The world techno reference at Rex Club",
    short_description: "Official Drumcode night",
    category: "dj" as EventCategory,
    music_genres: ["techno", "hard techno"],
    cover_image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(8, 23, 30),
    end_date: getRelativeDate(9, 7, 0),
    doors_open: getRelativeDate(8, 23, 30),
    status: "published",
    preview_token: null,
    is_featured: false,
    is_new: true,
    min_age: 18,
    dress_code: "Casual",
    additional_info: null,
    created_at: getRelativeDate(-2),
    updated_at: getRelativeDate(-2),
    venue: venues["le-rex-club"],
    ticket_types: createTicketTypes("event-8", [
      { name: "Presale", price: 20, quantity: 150, sold: 50 },
      { name: "Regular", price: 28, quantity: 250, sold: 30 },
    ]),
  },
  {
    id: "event-9",
    venue_id: "venue-7",
    organizer_id: "org-9",
    title: "Jamel Comedy Club - Best Of",
    slug: "jamel-comedy-club-best-of",
    description: "The best moments of the Jamel Comedy Club",
    short_description: "The best of French comedy",
    category: "comedy" as EventCategory,
    music_genres: [],
    cover_image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(7, 21, 0),
    end_date: getRelativeDate(7, 23, 30),
    doors_open: getRelativeDate(7, 20, 30),
    status: "published",
    preview_token: null,
    is_featured: false,
    is_new: true,
    min_age: 16,
    dress_code: null,
    additional_info: null,
    created_at: getRelativeDate(-1),
    updated_at: getRelativeDate(-1),
    venue: venues["comedy-club"],
    ticket_types: createTicketTypes("event-9", [
      { name: "Standard", price: 25, quantity: 200, sold: 50 },
      { name: "VIP", price: 45, quantity: 30, sold: 5 },
    ]),
  },
  {
    id: "event-10",
    venue_id: "venue-5",
    organizer_id: "org-10",
    title: "Sunset Sessions",
    slug: "sunset-sessions",
    description: "DJ set at sunset on the Seine",
    short_description: "House & disco at sunset",
    category: "dj" as EventCategory,
    music_genres: ["house", "disco", "nu-disco"],
    cover_image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(1, 18, 0),
    end_date: getRelativeDate(1, 23, 0),
    doors_open: getRelativeDate(1, 18, 0),
    status: "published",
    preview_token: null,
    is_featured: false,
    is_new: true,
    min_age: 18,
    dress_code: null,
    additional_info: null,
    created_at: getRelativeDate(0),
    updated_at: getRelativeDate(0),
    venue: venues["concrete"],
    ticket_types: createTicketTypes("event-10", [
      { name: "Entry", price: 0, quantity: 300, sold: 100 },
    ]),
  },
  {
    id: "event-11",
    venue_id: "venue-4",
    organizer_id: "org-11",
    title: "Ibeyi Live",
    slug: "ibeyi-live",
    description: "The Franco-Cuban twins in concert",
    short_description: "Soul and Afro-Cuban music",
    category: "concert" as EventCategory,
    music_genres: ["soul", "afro-cuban", "electronic"],
    cover_image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(12, 20, 0),
    end_date: getRelativeDate(12, 22, 30),
    doors_open: getRelativeDate(12, 19, 0),
    status: "published",
    preview_token: null,
    is_featured: false,
    is_new: true,
    min_age: null,
    dress_code: null,
    additional_info: null,
    created_at: getRelativeDate(-3),
    updated_at: getRelativeDate(-3),
    venue: venues["le-bataclan"],
    ticket_types: createTicketTypes("event-11", [
      { name: "Standing", price: 35, quantity: 600, sold: 150 },
    ]),
  },
  {
    id: "event-12",
    venue_id: "venue-3",
    organizer_id: "org-12",
    title: "Ballet de l'Opera - Swan Lake",
    slug: "ballet-lac-des-cygnes",
    description: "Tchaikovsky's masterpiece",
    short_description: "The classic Russian ballet",
    category: "theatre" as EventCategory,
    music_genres: ["classical"],
    cover_image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(15, 19, 30),
    end_date: getRelativeDate(15, 22, 0),
    doors_open: getRelativeDate(15, 19, 0),
    status: "published",
    preview_token: null,
    is_featured: true,
    is_new: true,
    min_age: null,
    dress_code: "Smart casual",
    additional_info: null,
    created_at: getRelativeDate(-2),
    updated_at: getRelativeDate(-2),
    venue: venues["theatre-mogador"],
    ticket_types: createTicketTypes("event-12", [
      { name: "Stalls", price: 89, quantity: 200, sold: 50 },
      { name: "Dress Circle", price: 129, quantity: 100, sold: 20 },
      { name: "Box", price: 179, quantity: 30, sold: 5 },
    ]),
  },

  // ==========================================================================
  // FEATURED - Featured events
  // ==========================================================================
  {
    id: "event-13",
    venue_id: "venue-6",
    organizer_id: "org-13",
    title: "Festival Electro Week",
    slug: "festival-electro-week",
    description: "3 days of electronic music at the Zenith",
    short_description: "The electronic festival of the year",
    category: "festival" as EventCategory,
    music_genres: ["techno", "house", "trance", "drum and bass"],
    cover_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(20, 18, 0),
    end_date: getRelativeDate(22, 6, 0),
    doors_open: getRelativeDate(20, 18, 0),
    status: "published",
    preview_token: null,
    is_featured: true,
    is_new: false,
    min_age: 18,
    dress_code: null,
    additional_info: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    venue: venues["zenith-paris"],
    ticket_types: createTicketTypes("event-13", [
      { name: "1 Day Pass", price: 45, quantity: 2000, sold: 1200 },
      { name: "3 Day Pass", price: 99, quantity: 1500, sold: 1100 },
      { name: "VIP 3 Day Pass", price: 199, quantity: 200, sold: 180 },
    ]),
  },
  {
    id: "event-14",
    venue_id: "venue-2",
    organizer_id: "org-14",
    title: "Jazz Night - Ibrahim Maalouf",
    slug: "jazz-night-ibrahim-maalouf",
    description: "The virtuoso trumpeter at L'Olympia",
    short_description: "An exceptional jazz evening",
    category: "concert" as EventCategory,
    music_genres: ["jazz", "world", "fusion"],
    cover_image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800",
    gallery: [],
    video_url: null,
    start_date: getRelativeDate(6, 20, 30),
    end_date: getRelativeDate(6, 23, 0),
    doors_open: getRelativeDate(6, 19, 30),
    status: "published",
    preview_token: null,
    is_featured: true,
    is_new: false,
    min_age: null,
    dress_code: null,
    additional_info: null,
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
    venue: venues["olympia"],
    ticket_types: createTicketTypes("event-14", [
      { name: "Category B", price: 39, quantity: 400, sold: 280 },
      { name: "Category A", price: 55, quantity: 300, sold: 250 },
      { name: "Premium", price: 75, quantity: 100, sold: 90 },
    ]),
  },
];

// =============================================================================
// HELPER FUNCTIONS FOR FILTERING
// =============================================================================

/**
 * Checks if the event is happening today
 */
export function isTonight(event: Event): boolean {
  const today = new Date();
  const eventDate = new Date(event.start_date);
  return (
    today.getDate() === eventDate.getDate() &&
    today.getMonth() === eventDate.getMonth() &&
    today.getFullYear() === eventDate.getFullYear()
  );
}

/**
 * Get events happening today
 */
export function getTonightEvents(): Event[] {
  return mockEvents.filter(isTonight);
}

/**
 * Get featured events
 */
export function getFeaturedEvents(): Event[] {
  return mockEvents.filter((event) => event.is_featured);
}

/**
 * Get new events (recently added)
 */
export function getNewEvents(): Event[] {
  return mockEvents.filter((event) => event.is_new);
}

/**
 * Get events by category
 */
export function getEventsByCategory(category: EventCategory): Event[] {
  return mockEvents.filter((event) => event.category === category);
}

/**
 * Get events happening this week
 */
export function getThisWeekEvents(): Event[] {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  return mockEvents.filter((event) => {
    const eventDate = new Date(event.start_date);
    return eventDate >= today && eventDate <= nextWeek;
  });
}

/**
 * Get event by slug with artists
 */
export function getEventBySlug(slug: string): Event | undefined {
  const event = mockEvents.find((e) => e.slug === slug);
  if (event) {
    // Attach artists if available
    const eventArtists = mockEventArtists[event.id];
    if (eventArtists) {
      return { ...event, event_artists: eventArtists };
    }
  }
  return event;
}

/**
 * Get minimum price for an event
 */
export function getMinPrice(event: Event): number {
  if (!event.ticket_types || event.ticket_types.length === 0) return 0;
  return Math.min(...event.ticket_types.map((t) => t.price));
}
