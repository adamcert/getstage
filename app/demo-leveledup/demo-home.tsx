"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import {
  Search,
  ArrowRight,
  Calendar,
  MapPin,
  Music,
  Disc3,
  Drama,
  Laugh,
  Tent,
  Trophy,
  Film,
  Frame,
  Flame,
} from "lucide-react";
import { cn, formatDate, formatTime, formatPrice } from "@/lib/utils";
import type { Event } from "@/types/database";

// ─── Types ─────────────────────────────────────────────────────────

interface DemoHomeProps {
  tonightEvents: Event[];
  featuredEvents: Event[];
  newEvents: Event[];
  allEvents: Event[];
}

// ─── Helpers ───────────────────────────────────────────────────────

const displayFont: React.CSSProperties = {
  fontFamily: "var(--font-display-demo), sans-serif",
};

function getMinPrice(event: Event): number {
  if (!event.ticket_types || event.ticket_types.length === 0) return 0;
  return Math.min(...event.ticket_types.map((t) => t.price));
}

function formatPriceDisplay(price: number): string {
  return price === 0 ? "Gratuit" : `Dès ${formatPrice(price)}`;
}

// ─── Animation Variants ────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Categories Data ───────────────────────────────────────────────

const demoCategories = [
  { id: "concert", label: "Concerts", icon: Music, color: "from-primary-500 to-rose-600" },
  { id: "dj", label: "Clubs & DJ", icon: Disc3, color: "from-secondary-500 to-purple-600" },
  { id: "theatre", label: "Théâtre", icon: Drama, color: "from-fuchsia-500 to-pink-600" },
  { id: "comedy", label: "Comédie", icon: Laugh, color: "from-pink-500 to-rose-600" },
  { id: "festival", label: "Festivals", icon: Tent, color: "from-emerald-500 to-green-600" },
  { id: "sport", label: "Sport", icon: Trophy, color: "from-rose-500 to-pink-600" },
  { id: "expo", label: "Expos", icon: Frame, color: "from-indigo-500 to-blue-600" },
  { id: "film", label: "Cinéma", icon: Film, color: "from-cyan-500 to-sky-600" },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function DemoHome({
  tonightEvents,
  featuredEvents,
  newEvents,
  allEvents,
}: DemoHomeProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const spotlightEvents =
    tonightEvents.length > 0 ? tonightEvents : allEvents.slice(0, 5);
  const spotlightTitle =
    tonightEvents.length > 0 ? "CE SOIR" : "À NE PAS MANQUER";
  const spotlightSub =
    tonightEvents.length > 0
      ? "Les événements qui ont lieu ce soir"
      : "Les prochains événements à ne pas rater";

  return (
    <div className="bg-[#050507] -mt-16">
      {/* ═══════════════ HERO ═══════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      >
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary-500/20 blur-[150px]"
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -60, 40, 0],
              scale: [1, 1.3, 0.9, 1],
            }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-secondary-500/20 blur-[150px]"
            animate={{
              x: [0, -70, 50, 0],
              y: [0, 50, -70, 0],
              scale: [1, 0.8, 1.2, 1],
            }}
            transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[45%] left-[45%] w-[350px] h-[350px] rounded-full bg-fuchsia-500/10 blur-[120px]"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          />
        </div>

        {/* Scan lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px)",
            backgroundSize: "100% 3px",
          }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              style={displayFont}
              className="font-extrabold tracking-[-0.03em] leading-[1.1]"
            >
              <span className="block text-[14vw] sm:text-[11vw] lg:text-[9vw] text-zinc-100">
                VIVEZ
              </span>
              <span className="block text-[16vw] sm:text-[13vw] lg:text-[11vw] text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-fuchsia-400">
                LA SCÈNE
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex items-center justify-center gap-6"
          >
            <span className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-zinc-700" />
            <span
              style={displayFont}
              className="text-xs sm:text-sm tracking-[0.35em] uppercase text-zinc-500 font-medium"
            >
              Concerts &middot; Clubs &middot; Culture
            </span>
            <span className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-zinc-700" />
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <Link href="/search" className="block group">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-hover:text-primary-400 transition-colors" />
                <div className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/[0.04] border border-zinc-800 text-zinc-600 group-hover:border-zinc-700 group-hover:bg-white/[0.06] transition-all cursor-pointer text-left">
                  Rechercher un événement, artiste, lieu...
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12 text-sm text-zinc-600"
          >
            {[
              { n: "10K+", l: "événements" },
              { n: "50+", l: "villes" },
              { n: "100K+", l: "passionnés" },
            ].map((s) => (
              <div key={s.l} className="flex items-baseline gap-2">
                <span
                  style={displayFont}
                  className="text-xl sm:text-2xl font-bold text-zinc-300"
                >
                  {s.n}
                </span>
                <span>{s.l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-zinc-700/50 flex justify-center pt-2"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary-500"
              animate={{ y: [0, 14, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <div className="py-5 border-y border-zinc-800/30 overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          {[...allEvents, ...allEvents].map((event, i) => (
            <span
              key={`m-${i}`}
              style={displayFont}
              className="shrink-0 text-lg font-bold uppercase tracking-[0.15em] text-zinc-800 mx-6 whitespace-nowrap"
            >
              {event.title}
              <span className="ml-6 text-primary-600/40">&diams;</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ═══════════════ CE SOIR / SPOTLIGHT ═══════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10">
            <div className="flex items-center gap-4 mb-3">
              {tonightEvents.length > 0 && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold tracking-wider uppercase">
                  <Flame className="w-3.5 h-3.5" />
                  Live
                </span>
              )}
            </div>
            <h2
              style={displayFont}
              className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-zinc-100 tracking-[-0.04em]"
            >
              {spotlightTitle}
            </h2>
            <p className="mt-3 text-lg text-zinc-500">{spotlightSub}</p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div
              className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
            >
              {spotlightEvents.map((event) => (
                <PosterCard key={event.id} event={event} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ FEATURED BENTO ═══════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10">
            <h2
              style={displayFont}
              className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-zinc-100 tracking-[-0.04em]"
            >
              &Agrave; L&apos;AFFICHE
            </h2>
            <p className="mt-3 text-lg text-zinc-500">
              Notre sélection des meilleurs événements
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ gridAutoRows: "240px" }}
          >
            {featuredEvents.slice(0, 5).map((event, i) => (
              <BentoCard
                key={event.id}
                event={event}
                large={i === 0}
                className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
              />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ CATEGORIES ═══════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10">
            <h2
              style={displayFont}
              className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-zinc-100 tracking-[-0.04em]"
            >
              EXPLORE
            </h2>
            <p className="mt-3 text-lg text-zinc-500">
              Trouvez les événements qui vous passionnent
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            {demoCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.id} variants={fadeUp}>
                  <Link
                    href={`/search?category=${cat.id}`}
                    className="group relative block rounded-2xl overflow-hidden h-32 sm:h-40"
                  >
                    {/* Gradient revealed on hover */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        cat.color
                      )}
                    />
                    {/* Base dark background */}
                    <div className="absolute inset-0 bg-zinc-900 group-hover:bg-transparent transition-colors duration-500" />
                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center gap-3 z-10">
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-500 group-hover:text-white transition-colors duration-300" />
                      <span
                        style={displayFont}
                        className="text-xs sm:text-sm font-bold tracking-wider uppercase text-zinc-400 group-hover:text-white transition-colors duration-300"
                      >
                        {cat.label}
                      </span>
                    </div>
                    {/* Border */}
                    <div className="absolute inset-0 border border-zinc-800 group-hover:border-transparent rounded-2xl transition-colors duration-300 pointer-events-none" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ NOUVEAUTÉS - RANKED LIST ═══════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="mb-10 flex items-end justify-between"
          >
            <div>
              <h2
                style={displayFont}
                className="text-5xl sm:text-6xl lg:text-8xl font-extrabold text-zinc-100 tracking-[-0.04em]"
              >
                FRESH
              </h2>
              <p className="mt-3 text-lg text-zinc-500">
                Les derniers événements ajoutés
              </p>
            </div>
            <Link
              href="/search?sort=new"
              className="hidden sm:flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 font-semibold transition-colors"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div variants={stagger} className="space-y-1">
            {newEvents.slice(0, 6).map((event, i) => (
              <motion.div key={event.id} variants={fadeUp}>
                <RankedRow event={event} rank={i + 1} />
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile see all */}
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/search?sort=new"
              className="inline-flex items-center gap-2 text-fuchsia-400 font-semibold"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/15 via-secondary-600/10 to-fuchsia-600/5" />
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[200px]"
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary-500/10 blur-[200px]"
            animate={{ y: [20, -20, 20] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          className="relative z-10 text-center px-4 max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            style={displayFont}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-zinc-100 tracking-[-0.04em]"
          >
            Rejoignez{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              la scène
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-lg sm:text-xl text-zinc-400"
          >
            Plus de 10 000 événements vous attendent. Concerts, clubs, festivals
            et plus encore.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10">
            <Link
              href="/search"
              style={displayFont}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              Explorer les événements
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// POSTER CARD - Tall poster-style card for horizontal scroll
// ═══════════════════════════════════════════════════════════════════

function PosterCard({ event }: { event: Event }) {
  const minPrice = getMinPrice(event);

  return (
    <Link
      href={`/event/${event.slug}`}
      className="block shrink-0 snap-start"
    >
      <motion.div
        className="relative w-[260px] sm:w-[280px] h-[380px] sm:h-[420px] rounded-2xl overflow-hidden group cursor-pointer"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Image */}
        <Image
          src={event.cover_image || "/placeholder-event.jpg"}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="280px"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Neon bottom accent - appears on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 via-secondary-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Price badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-sm font-bold text-zinc-100 border border-white/10">
            {formatPriceDisplay(minPrice)}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3
            style={displayFont}
            className="text-xl font-bold text-white mb-3 line-clamp-2 tracking-tight"
          >
            {event.title}
          </h3>
          <div className="space-y-1.5 text-sm text-zinc-400">
            <p className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary-400 shrink-0" />
              <span className="truncate">
                {formatDate(event.start_date)} &middot;{" "}
                {formatTime(event.start_date)}
              </span>
            </p>
            {event.venue && (
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                <span className="truncate">{event.venue.name}</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BENTO CARD - Asymmetric grid card for featured section
// ═══════════════════════════════════════════════════════════════════

function BentoCard({
  event,
  large,
  className,
}: {
  event: Event;
  large?: boolean;
  className?: string;
}) {
  const minPrice = getMinPrice(event);

  return (
    <Link href={`/event/${event.slug}`} className={cn("block", className)}>
      <motion.div
        className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Image */}
        <Image
          src={event.cover_image || "/placeholder-event.jpg"}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Neon border on hover */}
        <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary-500/30 transition-colors duration-500 pointer-events-none" />

        {/* Price */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-sm font-bold text-white border border-white/10">
            {formatPriceDisplay(minPrice)}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h3
            style={displayFont}
            className={cn(
              "font-bold text-white tracking-tight line-clamp-2",
              large ? "text-2xl lg:text-3xl" : "text-lg"
            )}
          >
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(event.start_date)}
            </span>
            {event.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {event.venue.name}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════
// RANKED ROW - List item for new events section
// ═══════════════════════════════════════════════════════════════════

function RankedRow({ event, rank }: { event: Event; rank: number }) {
  const minPrice = getMinPrice(event);

  return (
    <Link href={`/event/${event.slug}`}>
      <div className="group flex items-center gap-4 sm:gap-6 p-4 rounded-2xl hover:bg-zinc-900/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-zinc-800/50">
        {/* Rank number */}
        <span
          style={displayFont}
          className="text-3xl sm:text-5xl font-extrabold text-zinc-800 group-hover:text-zinc-600 transition-colors w-10 sm:w-16 text-right shrink-0 tabular-nums"
        >
          {String(rank).padStart(2, "0")}
        </span>

        {/* Thumbnail */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0">
          <Image
            src={event.cover_image || "/placeholder-event.jpg"}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="64px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            style={displayFont}
            className="font-bold text-zinc-200 text-base sm:text-lg truncate group-hover:text-white transition-colors"
          >
            {event.title}
          </h3>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-500 mt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="truncate">{formatDate(event.start_date)}</span>
            </span>
            {event.venue && (
              <span className="hidden sm:flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{event.venue.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Price + Arrow */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <span className="hidden sm:block text-sm font-bold text-primary-400">
            {formatPriceDisplay(minPrice)}
          </span>
          <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
