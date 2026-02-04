"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { SearchInput } from "@/components/search/search-input";
import { FilterBar, FilterSheet, FilterTrigger } from "@/components/search/filters";
import { EventCard } from "@/components/features/event-card";
import { mockEvents } from "@/lib/data/mock-events";
import type { Event, EventFilters, EventCategory } from "@/types/database";

// =============================================================================
// ANIMATIONS
// =============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

const emptyStateVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse URL search params into EventFilters
 */
function parseFiltersFromParams(searchParams: URLSearchParams): EventFilters {
  const filters: EventFilters = {};

  const query = searchParams.get("q");
  if (query) filters.query = query;

  const category = searchParams.get("category");
  if (category) filters.category = category as EventCategory;

  const city = searchParams.get("city");
  if (city) filters.city = city;

  const priceMin = searchParams.get("priceMin");
  if (priceMin) filters.priceMin = parseInt(priceMin, 10);

  const priceMax = searchParams.get("priceMax");
  if (priceMax) filters.priceMax = parseInt(priceMax, 10);

  const isFree = searchParams.get("free");
  if (isFree === "true") filters.isFree = true;

  const isTonight = searchParams.get("tonight");
  if (isTonight === "true") filters.isTonight = true;

  const dateFrom = searchParams.get("dateFrom");
  if (dateFrom) filters.dateFrom = dateFrom;

  const dateTo = searchParams.get("dateTo");
  if (dateTo) filters.dateTo = dateTo;

  return filters;
}

/**
 * Convert EventFilters to URL search params
 */
function filtersToParams(filters: EventFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.city) params.set("city", filters.city);
  if (filters.priceMin !== undefined) params.set("priceMin", filters.priceMin.toString());
  if (filters.priceMax !== undefined) params.set("priceMax", filters.priceMax.toString());
  if (filters.isFree) params.set("free", "true");
  if (filters.isTonight) params.set("tonight", "true");
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);

  return params;
}

/**
 * Get minimum ticket price for an event
 */
function getMinPrice(event: Event): number {
  if (!event.ticket_types || event.ticket_types.length === 0) return 0;
  return event.ticket_types.reduce(
    (min, ticket) => (ticket.price < min ? ticket.price : min),
    event.ticket_types[0].price
  );
}

/**
 * Check if event is happening today
 */
function isEventTonight(event: Event): boolean {
  const today = new Date();
  const eventDate = new Date(event.start_date);
  return (
    today.getDate() === eventDate.getDate() &&
    today.getMonth() === eventDate.getMonth() &&
    today.getFullYear() === eventDate.getFullYear()
  );
}

/**
 * Filter events based on filters
 */
function filterEvents(events: Event[], filters: EventFilters): Event[] {
  return events.filter((event) => {
    // Text search (title, description, venue name)
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const matchTitle = event.title.toLowerCase().includes(query);
      const matchDescription = event.description?.toLowerCase().includes(query);
      const matchVenue = event.venue?.name.toLowerCase().includes(query);
      const matchCategory = event.category.toLowerCase().includes(query);
      if (!matchTitle && !matchDescription && !matchVenue && !matchCategory) {
        return false;
      }
    }

    // Category filter
    if (filters.category && event.category !== filters.category) {
      return false;
    }

    // City filter (simulated - checking venue city)
    if (filters.city) {
      const eventCity = event.venue?.city?.toLowerCase();
      if (!eventCity || eventCity !== filters.city.toLowerCase()) {
        return false;
      }
    }

    // Price filters
    const minPrice = getMinPrice(event);

    // Free events filter
    if (filters.isFree && minPrice > 0) {
      return false;
    }

    // Price range filter
    if (filters.priceMin !== undefined && minPrice < filters.priceMin) {
      return false;
    }
    if (filters.priceMax !== undefined && minPrice > filters.priceMax) {
      return false;
    }

    // Tonight filter
    if (filters.isTonight && !isEventTonight(event)) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const eventDate = new Date(event.start_date);
      const fromDate = new Date(filters.dateFrom);
      if (eventDate < fromDate) {
        return false;
      }
    }
    if (filters.dateTo) {
      const eventDate = new Date(event.start_date);
      const toDate = new Date(filters.dateTo);
      if (eventDate > toDate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Count active filters
 */
function countActiveFilters(filters: EventFilters): number {
  let count = 0;
  if (filters.category) count++;
  if (filters.city) count++;
  if (filters.dateFrom || filters.dateTo || filters.isTonight) count++;
  if (filters.priceMin !== undefined || filters.priceMax !== undefined || filters.isFree) count++;
  return count;
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}

// =============================================================================
// SEARCH PAGE CONTENT (uses useSearchParams)
// =============================================================================

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<EventFilters>({});
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from URL params
  useEffect(() => {
    const initialFilters = parseFiltersFromParams(searchParams);
    setFilters(initialFilters);
    setSearchQuery(initialFilters.query || "");
    setIsInitialized(true);
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: EventFilters) => {
      const params = filtersToParams(newFilters);
      const queryString = params.toString();
      router.push(queryString ? `/search?${queryString}` : "/search", { scroll: false });
    },
    [router]
  );

  // Handle search submission
  const handleSearch = useCallback(
    (query: string) => {
      const newFilters = { ...filters, query: query || undefined };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: EventFilters) => {
      const updatedFilters = { ...newFilters, query: filters.query };
      setFilters(updatedFilters);
      updateURL(updatedFilters);
    },
    [filters.query, updateURL]
  );

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!isInitialized) return [];
    return filterEvents(mockEvents, filters);
  }, [filters, isInitialized]);

  // Count active filters (excluding search query)
  const activeFiltersCount = useMemo(() => countActiveFilters(filters), [filters]);

  // Don't render until initialized to avoid hydration mismatch
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-6">
            <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================== */}
      {/* HEADER SECTION */}
      {/* ================================================================== */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Title */}
          <motion.h1
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Explorer les evenements
          </motion.h1>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder="Rechercher un evenement, un artiste, un lieu..."
              className="max-w-2xl"
            />
          </motion.div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FILTERS SECTION */}
      {/* ================================================================== */}
      <div className="sticky top-[120px] md:top-[140px] z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Desktop Filter Bar */}
            <FilterBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              className="flex-1"
            />

            {/* Mobile Filter Trigger */}
            <FilterTrigger
              activeCount={activeFiltersCount}
              onClick={() => setIsFilterSheetOpen(true)}
            />

            {/* Results Counter */}
            <motion.div
              className="hidden sm:flex items-center text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="font-semibold text-gray-900">{filteredEvents.length}</span>
              <span className="ml-1">
                evenement{filteredEvents.length !== 1 ? "s" : ""} trouve{filteredEvents.length !== 1 ? "s" : ""}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Mobile Results Counter */}
        <motion.p
          className="sm:hidden text-sm text-gray-500 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="font-semibold text-gray-900">{filteredEvents.length}</span>
          {" "}evenement{filteredEvents.length !== 1 ? "s" : ""} trouve{filteredEvents.length !== 1 ? "s" : ""}
        </motion.p>

        <AnimatePresence mode="wait">
          {filteredEvents.length > 0 ? (
            /* ============================================================ */
            /* EVENTS GRID */
            /* ============================================================ */
            <motion.div
              key="results"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  variants={cardVariants}
                  layout
                  layoutId={event.id}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* ============================================================ */
            /* EMPTY STATE */
            /* ============================================================ */
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-16 md:py-24"
              variants={emptyStateVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Search className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
                Aucun evenement trouve
              </h2>
              <p className="text-gray-500 text-center max-w-md mb-6">
                {filters.query
                  ? `Aucun resultat pour "${filters.query}". Essayez de modifier vos criteres de recherche.`
                  : "Aucun evenement ne correspond a vos filtres. Essayez d'ajuster vos criteres."}
              </p>
              <button
                onClick={() => {
                  setFilters({});
                  setSearchQuery("");
                  router.push("/search", { scroll: false });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Reinitialiser les filtres
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ================================================================== */}
      {/* MOBILE FILTER SHEET */}
      {/* ================================================================== */}
      <FilterSheet
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
      />
    </div>
  );
}

// =============================================================================
// SEARCH PAGE (with Suspense boundary)
// =============================================================================

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
