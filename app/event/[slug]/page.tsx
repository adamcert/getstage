"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Share2,
  Heart,
  ChevronLeft,
  ExternalLink,
  Music2,
  Users,
  Shirt,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketSelector } from "@/components/features/ticket-selector";
import { getEventBySlug, isTonight } from "@/lib/data/mock-events";
import { cn, formatDate, formatTime, formatPrice } from "@/lib/utils";
import type { Event, Artist, EventArtist } from "@/types/database";

// =============================================================================
// TYPES
// =============================================================================

interface EventDetailPageProps {
  params: { slug: string };
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// -----------------------------------------------------------------------------
// Event Header
// -----------------------------------------------------------------------------

interface EventHeaderProps {
  event: Event;
  minPrice: number;
}

function EventHeader({ event, minPrice }: EventHeaderProps) {
  const tonight = isTonight(event);
  const isSoldOut = event.ticket_types?.every(
    (t) => t.quantity_sold >= t.quantity_total
  );

  return (
    <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden">
      {/* Cover Image */}
      <Image
        src={event.cover_image || "/placeholder-event.jpg"}
        alt={event.title}
        fill
        className="object-cover"
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="bg-zinc-900/50 backdrop-blur-md hover:bg-zinc-800/70 text-zinc-100"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour
          </Button>
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="bg-zinc-900/50 backdrop-blur-md hover:bg-zinc-800/70 text-zinc-100"
        >
          <Heart className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-zinc-900/50 backdrop-blur-md hover:bg-zinc-800/70 text-zinc-100"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Badges */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {event.is_new && <Badge variant="new">Nouveau</Badge>}
        {event.is_featured && <Badge variant="featured">Coup de coeur</Badge>}
        {tonight && <Badge variant="tonight">Ce soir</Badge>}
        {isSoldOut && <Badge variant="soldout">Complet</Badge>}
      </div>

      {/* Event Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
        <div className="max-w-4xl">
          {/* Category */}
          <Badge variant="default" className="mb-3 bg-white/20 text-white">
            {getCategoryLabel(event.category)}
          </Badge>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-display">{event.title}</h1>

          {/* Quick Info */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-white/90">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" />
              {formatDate(event.start_date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" />
              {event.doors_open
                ? `Portes ${formatTime(event.doors_open)}`
                : formatTime(event.start_date)}
            </span>
            {event.venue && (
              <Link
                href={`/venue/${event.venue.slug}`}
                className="flex items-center gap-2 hover:text-primary-400 transition-colors"
              >
                <MapPin className="w-5 h-5 text-primary-400" />
                {event.venue.name}, {event.venue.city}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Event Info Section
// -----------------------------------------------------------------------------

interface EventInfoSectionProps {
  event: Event;
}

function EventInfoSection({ event }: EventInfoSectionProps) {
  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Description */}
        <div>
          <h2 className="text-xl font-bold text-zinc-100 mb-3 font-display">
            À propos de l'événement
          </h2>
          <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
            {event.description || event.short_description || "Aucune description disponible."}
          </p>
        </div>

        {/* Music Genres */}
        {event.music_genres && event.music_genres.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Music2 className="w-4 h-4" />
              Genres musicaux
            </h3>
            <div className="flex flex-wrap gap-2">
              {event.music_genres.map((genre) => (
                <Badge key={genre} variant="default">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
          {/* Min Age */}
          {event.min_age && (
            <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary-500/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Age minimum</p>
                <p className="font-semibold text-zinc-200">{event.min_age} ans</p>
              </div>
            </div>
          )}

          {/* Dress Code */}
          {event.dress_code && (
            <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-secondary-500/15 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-secondary-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Dress code</p>
                <p className="font-semibold text-zinc-200">{event.dress_code}</p>
              </div>
            </div>
          )}

          {/* Category */}
          <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-accent-500/15 flex items-center justify-center">
              <Info className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Catégorie</p>
              <p className="font-semibold text-zinc-200">
                {getCategoryLabel(event.category)}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {event.additional_info && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-sm text-amber-200">{event.additional_info}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Venue Section
// -----------------------------------------------------------------------------

interface VenueSectionProps {
  event: Event;
}

function VenueSection({ event }: VenueSectionProps) {
  if (!event.venue) return null;

  const venue = event.venue;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${venue.address}, ${venue.postal_code} ${venue.city}`
  )}`;

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-100 font-display">Lieu</h2>

        <div className="flex items-start gap-4">
          {/* Venue Logo or Icon */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
            {venue.cover_image ? (
              <Image
                src={venue.cover_image}
                alt={venue.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-500">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Venue Info */}
          <div className="flex-1">
            <Link
              href={`/venue/${venue.slug}`}
              className="text-lg font-semibold text-zinc-100 hover:text-primary-400 transition-colors"
            >
              {venue.name}
            </Link>
            <p className="text-zinc-500 text-sm mt-1">
              {venue.address}
              <br />
              {venue.postal_code} {venue.city}
            </p>
            {venue.phone && (
              <p className="text-zinc-500 text-sm mt-1">{venue.phone}</p>
            )}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="relative w-full h-48 bg-zinc-800 rounded-xl overflow-hidden">
          {/* Placeholder for Mapbox */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">Carte interactive</p>
              <p className="text-xs text-zinc-600">Mapbox integration</p>
            </div>
          </div>
        </div>

        {/* Directions Link */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 font-medium transition-colors"
        >
          <Navigation className="w-5 h-5" />
          Voir l'itinéraire
          <ExternalLink className="w-4 h-4" />
        </a>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Lineup Section
// -----------------------------------------------------------------------------

interface LineupSectionProps {
  event: Event;
}

function LineupSection({ event }: LineupSectionProps) {
  const artists = event.event_artists;

  if (!artists || artists.length === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-100 font-display">Line-up</h2>

        <div className="space-y-4">
          {artists.map((ea) => (
            <ArtistCard key={ea.id} eventArtist={ea} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ArtistCardProps {
  eventArtist: EventArtist & { artist: Artist };
}

function ArtistCard({ eventArtist }: ArtistCardProps) {
  const { artist, is_headliner, set_time, stage } = eventArtist;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-all",
        is_headliner
          ? "bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20"
          : "bg-zinc-800 hover:bg-zinc-700"
      )}
    >
      {/* Artist Image */}
      <Avatar
        src={artist.image_url}
        alt={artist.name}
        fallback={artist.name}
        size="xl"
      />

      {/* Artist Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-zinc-100">{artist.name}</h3>
          {is_headliner && (
            <Badge variant="featured" className="text-[10px] px-2 py-0.5">
              Tête d'affiche
            </Badge>
          )}
        </div>
        {artist.genres && artist.genres.length > 0 && (
          <p className="text-sm text-zinc-500 mt-0.5">
            {artist.genres.slice(0, 3).join(", ")}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
          {set_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(set_time)}
            </span>
          )}
          {stage && <span>Scène: {stage}</span>}
        </div>
      </div>

      {/* Spotify Link */}
      {artist.spotify_id && (
        <a
          href={`https://open.spotify.com/artist/${artist.spotify_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#1DB954] text-white rounded-full text-sm font-medium hover:bg-[#1ed760] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Spotify
        </a>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sidebar Sticky
// -----------------------------------------------------------------------------

interface SidebarStickyProps {
  event: Event;
  minPrice: number;
}

function SidebarSticky({ event, minPrice }: SidebarStickyProps) {
  return (
    <div className="sticky top-24">
      {/* Price Preview Card */}
      <Card className="mb-4 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
          <p className="text-sm opacity-90">À partir de</p>
          <p className="text-3xl font-bold font-display">
            {minPrice === 0 ? "Gratuit" : formatPrice(minPrice)}
          </p>
        </div>
      </Card>

      {/* Ticket Selector */}
      {event.ticket_types && event.ticket_types.length > 0 && (
        <TicketSelector
          ticketTypes={event.ticket_types}
          eventId={event.id}
          eventTitle={event.title}
          eventDate={event.start_date}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Mobile Bottom Sheet
// -----------------------------------------------------------------------------

interface MobileBottomSheetProps {
  event: Event;
  minPrice: number;
  isOpen: boolean;
  onClose: () => void;
}

function MobileBottomSheet({
  event,
  minPrice,
  isOpen,
  onClose,
}: MobileBottomSheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 rounded-t-3xl max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="sticky top-0 bg-zinc-900 pt-3 pb-2 px-4 flex justify-center border-b border-zinc-800">
              <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>

            {/* Content */}
            <div className="p-4 pb-8">
              <h3 className="text-xl font-bold text-zinc-100 mb-4 font-display">
                Choisir vos billets
              </h3>
              {event.ticket_types && event.ticket_types.length > 0 && (
                <TicketSelector
                  ticketTypes={event.ticket_types}
                  eventId={event.id}
                  eventTitle={event.title}
                  eventDate={event.start_date}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// Mobile Floating Button
// -----------------------------------------------------------------------------

interface MobileFloatingButtonProps {
  minPrice: number;
  onClick: () => void;
}

function MobileFloatingButton({ minPrice, onClick }: MobileFloatingButtonProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800 lg:hidden z-40"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500">À partir de</p>
          <p className="text-xl font-bold text-zinc-100">
            {minPrice === 0 ? "Gratuit" : formatPrice(minPrice)}
          </p>
        </div>
        <Button onClick={onClick} className="flex-1 max-w-[200px]">
          Réserver
        </Button>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Header Skeleton */}
      <Skeleton className="w-full aspect-video md:aspect-[21/9]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <Skeleton className="h-96 rounded-2xl sticky top-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    concert: "Concert",
    dj: "DJ / Club",
    theatre: "Théâtre",
    comedy: "Humour",
    expo: "Exposition",
    film: "Cinéma",
    party: "Soirée",
    festival: "Festival",
    other: "Autre",
  };
  return labels[category] || category;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const foundEvent = getEventBySlug(slug);
      setEvent(foundEvent || null);
      setIsLoading(false);
    };

    fetchEvent();
  }, [slug]);

  const handleOpenSheet = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  // Loading state
  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  // Not found state
  if (!event) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100 mb-2 font-display">
            Événement introuvable
          </h1>
          <p className="text-zinc-500 mb-6">
            Cet événement n'existe pas ou a été supprimé.
          </p>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate min price
  const minPrice =
    event.ticket_types && event.ticket_types.length > 0
      ? Math.min(...event.ticket_types.map((t) => t.price))
      : 0;

  return (
    <div className="min-h-screen bg-[#09090B] pb-24 lg:pb-8">
      {/* Event Header */}
      <EventHeader event={event} minPrice={minPrice} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <EventInfoSection event={event} />

            {/* Venue Section */}
            <VenueSection event={event} />

            {/* Lineup Section */}
            <LineupSection event={event} />
          </div>

          {/* Right Column - Sticky Sidebar (Desktop) */}
          <div className="hidden lg:block">
            <SidebarSticky event={event} minPrice={minPrice} />
          </div>
        </div>
      </div>

      {/* Mobile Floating Button */}
      <MobileFloatingButton minPrice={minPrice} onClick={handleOpenSheet} />

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet
        event={event}
        minPrice={minPrice}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </div>
  );
}
