"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { EventCard } from "@/components/features";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/database";

interface EventSectionProps {
  title: string;
  subtitle?: string;
  events: Event[];
  variant?: "default" | "featured";
  viewAllLink?: string;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * EventSection Component
 *
 * A reusable section component for displaying a grid of events.
 * Supports two variants:
 * - `default`: Standard grid layout with smaller cards
 * - `featured`: Larger cards with featured variant styling
 *
 * @example
 * // Default variant
 * <EventSection
 *   title="Ce soir"
 *   subtitle="Les événements du jour"
 *   events={tonightEvents}
 *   viewAllLink="/search?filter=tonight"
 * />
 *
 * // Featured variant
 * <EventSection
 *   title="Coups de cœur"
 *   events={featuredEvents}
 *   variant="featured"
 * />
 */
export function EventSection({
  title,
  subtitle,
  events,
  variant = "default",
  viewAllLink,
  className,
}: EventSectionProps) {
  if (events.length === 0) {
    return null;
  }

  const isFeatured = variant === "featured";

  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex items-end justify-between mb-8"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-zinc-100">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-zinc-500 text-base md:text-lg">
                {subtitle}
              </p>
            )}
          </div>

          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="hidden sm:flex items-center gap-1 text-accent-400 hover:text-accent-300 font-medium transition-colors group"
            >
              Voir tout
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </motion.div>

        {/* Events Grid */}
        <motion.div
          className={cn(
            "grid gap-6",
            isFeatured
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {events.map((event) => (
            <motion.div key={event.id} variants={itemVariants}>
              <EventCard
                event={event}
                variant={isFeatured ? "featured" : "default"}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile "View All" Link */}
        {viewAllLink && (
          <div className="mt-8 text-center sm:hidden">
            <Link
              href={viewAllLink}
              className="inline-flex items-center gap-1 text-accent-400 hover:text-accent-300 font-medium transition-colors"
            >
              Voir tout
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
