"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import type { Event } from "@/types/database";

interface EventCardProps {
  event: Event;
  variant?: "default" | "compact" | "featured";
}

/**
 * Calculates the minimum ticket price for an event
 */
function getMinPrice(event: Event): number {
  if (!event.ticket_types || event.ticket_types.length === 0) {
    return 0;
  }
  return event.ticket_types.reduce(
    (min, ticket) => (ticket.price < min ? ticket.price : min),
    event.ticket_types[0].price
  );
}

/**
 * Checks if the event is happening today
 */
function isTonight(startDate: string): boolean {
  const today = new Date();
  const eventDate = new Date(startDate);
  return (
    today.getDate() === eventDate.getDate() &&
    today.getMonth() === eventDate.getMonth() &&
    today.getFullYear() === eventDate.getFullYear()
  );
}

/**
 * Checks if all ticket types are sold out
 */
function isSoldOut(event: Event): boolean {
  if (!event.ticket_types || event.ticket_types.length === 0) {
    return false;
  }
  return event.ticket_types.every(
    (ticket) => ticket.quantity_sold >= ticket.quantity_total
  );
}

/**
 * Checks if the event is "hot" (selling fast)
 * An event is considered hot if more than 80% of tickets are sold
 */
function isHot(event: Event): boolean {
  if (!event.ticket_types || event.ticket_types.length === 0) {
    return false;
  }
  const totalTickets = event.ticket_types.reduce(
    (sum, t) => sum + t.quantity_total,
    0
  );
  const soldTickets = event.ticket_types.reduce(
    (sum, t) => sum + t.quantity_sold,
    0
  );
  return totalTickets > 0 && soldTickets / totalTickets >= 0.8;
}

/**
 * Formats the price display text
 */
function formatPriceDisplay(price: number): string {
  return price === 0 ? "Gratuit" : `${formatPrice(price)}`;
}

/**
 * EventCard Component - Compact Variant
 * A smaller card for lists and sidebars
 */
function EventCardCompact({ event }: { event: Event }) {
  const minPrice = getMinPrice(event);

  return (
    <Link href={`/event/${event.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card variant="interactive" className="flex gap-4 p-4">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={event.cover_image || "/placeholder-event.jpg"}
              alt={event.title}
              fill
              className="object-cover"
              sizes="80px"
            />
            {isSoldOut(event) && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">Complet</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(event.start_date)}
            </p>
            <p className="text-sm font-semibold text-primary-500 mt-1">
              {minPrice === 0 ? "Gratuit" : `Des ${formatPrice(minPrice)}`}
            </p>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

/**
 * EventCard Component - Featured Variant
 * Large card with overlay gradient for hero sections
 */
function EventCardFeatured({ event }: { event: Event }) {
  const minPrice = getMinPrice(event);
  const soldOut = isSoldOut(event);
  const tonight = isTonight(event.start_date);
  const hot = isHot(event);

  return (
    <Link href={`/event/${event.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card variant="interactive" className="relative overflow-hidden h-[400px]">
          {/* Background Image */}
          <Image
            src={event.cover_image || "/placeholder-event.jpg"}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Badges - Top Left */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {event.is_featured && <Badge variant="featured">Coup de coeur</Badge>}
            {event.is_new && <Badge variant="new">Nouveau</Badge>}
            {hot && !soldOut && <Badge variant="hot">Populaire</Badge>}
            {tonight && <Badge variant="tonight">Ce soir</Badge>}
            {soldOut && <Badge variant="soldout">Complet</Badge>}
          </div>

          {/* Content - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2 line-clamp-2">{event.title}</h3>

            {/* Event Details */}
            <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-4">
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

            {/* Price and CTA */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                {minPrice === 0 ? "Gratuit" : `Des ${formatPrice(minPrice)}`}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors">
                Reserver
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

/**
 * EventCard Component - Default Variant
 * Standard card with image, badges, price, and event info
 */
function EventCardDefault({ event }: { event: Event }) {
  const minPrice = getMinPrice(event);
  const soldOut = isSoldOut(event);
  const tonight = isTonight(event.start_date);
  const hot = isHot(event);

  return (
    <Link href={`/event/${event.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <Card variant="interactive" className="overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={event.cover_image || "/placeholder-event.jpg"}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Badges - Top Left */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {event.is_featured && <Badge variant="featured">Coup de coeur</Badge>}
              {event.is_new && <Badge variant="new">Nouveau</Badge>}
              {hot && !soldOut && <Badge variant="hot">Populaire</Badge>}
              {tonight && <Badge variant="tonight">Ce soir</Badge>}
              {soldOut && <Badge variant="soldout">Complet</Badge>}
            </div>

            {/* Price Tag - Bottom Right */}
            <div className="absolute bottom-3 right-3">
              <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-gray-900 shadow-lg">
                {formatPriceDisplay(minPrice)}
              </span>
            </div>

            {/* Sold Out Overlay */}
            {soldOut && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Complet
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
              {event.title}
            </h3>

            <div className="space-y-1.5 text-sm text-gray-500">
              {/* Date and Time */}
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="truncate">
                  {formatDate(event.start_date)} - {formatTime(event.start_date)}
                </span>
              </p>

              {/* Location */}
              {event.venue && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="truncate">
                    {event.venue.name}
                    {event.venue.city && `, ${event.venue.city}`}
                  </span>
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

/**
 * EventCard Component
 *
 * A versatile card component for displaying event information with three variants:
 * - `default`: Standard card with image, badges, price, title, date, and location
 * - `compact`: Smaller version for lists and sidebars
 * - `featured`: Large card with gradient overlay for hero sections
 *
 * @example
 * // Default variant
 * <EventCard event={event} />
 *
 * // Compact variant for lists
 * <EventCard event={event} variant="compact" />
 *
 * // Featured variant for hero sections
 * <EventCard event={event} variant="featured" />
 */
export function EventCard({ event, variant = "default" }: EventCardProps) {
  switch (variant) {
    case "compact":
      return <EventCardCompact event={event} />;
    case "featured":
      return <EventCardFeatured event={event} />;
    default:
      return <EventCardDefault event={event} />;
  }
}
