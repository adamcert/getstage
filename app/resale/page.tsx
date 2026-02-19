"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Search,
  Tag,
  Calendar,
  MapPin,
  Ticket,
  ShieldCheck,
  RefreshCcw,
  CreditCard,
  ChevronDown,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  mockResaleTickets,
  calculateDiscount,
  getResaleCategories,
  type ResaleTicket,
} from "@/lib/data/mock-resale";
import type { EventCategory } from "@/types/database";

// =============================================================================
// ANIMATIONS
// =============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
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
// CATEGORY LABELS
// =============================================================================

const categoryLabels: Record<EventCategory, string> = {
  concert: "Concert",
  dj: "DJ / Electro",
  theatre: "Théâtre",
  comedy: "Humour",
  expo: "Exposition",
  film: "Cinéma",
  party: "Soirée",
  festival: "Festival",
  other: "Autre",
};

// =============================================================================
// RESALE TICKET CARD COMPONENT
// =============================================================================

interface ResaleTicketCardProps {
  ticket: ResaleTicket;
}

function ResaleTicketCard({ ticket }: ResaleTicketCardProps) {
  const discount = calculateDiscount(ticket.originalPrice, ticket.resalePrice);
  const hasDiscount = discount > 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card variant="interactive" className="overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={ticket.event.cover_image || "/placeholder-event.jpg"}
            alt={ticket.event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3">
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Badge className="bg-green-500 text-white font-bold px-3 py-1.5">
                  -{discount}%
                </Badge>
              </motion.div>
            </div>
          )}

          {/* Ticket Type Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="default" className="bg-zinc-900/90 backdrop-blur-sm text-zinc-300">
              {ticket.ticketType.name}
            </Badge>
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="tonight" className="backdrop-blur-sm">
              {categoryLabels[ticket.event.category]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Event Title */}
          <h3 className="font-bold text-zinc-100 text-lg mb-2 line-clamp-2">
            {ticket.event.title}
          </h3>

          {/* Event Details */}
          <div className="space-y-1.5 text-sm text-zinc-500 mb-4">
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <span className="truncate">{formatDate(ticket.event.start_date)}</span>
            </p>
            {ticket.event.venue && (
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="truncate">
                  {ticket.event.venue.name}
                  {ticket.event.venue.city && `, ${ticket.event.venue.city}`}
                </span>
              </p>
            )}
          </div>

          {/* Price Section */}
          <div className="mt-auto">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Prix de revente</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-zinc-100">
                    {formatPrice(ticket.resalePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-zinc-600 line-through">
                      {formatPrice(ticket.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-700 shadow-sm">
                  <Image
                    src={ticket.seller.avatar_url || "/placeholder-avatar.jpg"}
                    alt={ticket.seller.full_name || "Vendeur"}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <span className="text-xs text-zinc-500">{ticket.seller.full_name}</span>
              </div>
            </div>

            {/* Buy Button */}
            <Link href={`/checkout?resale=${ticket.id}`}>
              <Button className="w-full" size="md">
                <Ticket className="w-4 h-4" />
                Acheter
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// FILTER COMPONENTS
// =============================================================================

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon: React.ReactNode;
}

function FilterSelect({ label, value, onChange, options, icon }: FilterSelectProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
        {icon}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full pl-10 pr-10 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
    </div>
  );
}

// =============================================================================
// HOW IT WORKS SECTION
// =============================================================================

const howItWorksSteps = [
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Transactions sécurisées",
    description:
      "Chaque billet est vérifié et le paiement est sécurisé par Stripe. Vous êtes protégé contre la fraude.",
  },
  {
    icon: <Tag className="w-8 h-8" />,
    title: "Prix équitables",
    description:
      "Les billets sont revendus au prix d'achat original ou moins. Jamais de spéculation.",
  },
  {
    icon: <RefreshCcw className="w-8 h-8" />,
    title: "Transfert instantané",
    description:
      "Une fois l'achat confirmé, le billet est automatiquement transféré sur votre compte.",
  },
  {
    icon: <CreditCard className="w-8 h-8" />,
    title: "Remboursement garanti",
    description:
      "Si l'événement est annulé, vous êtes remboursé intégralement sous 48h.",
  },
];

function HowItWorksSection() {
  return (
    <motion.section
      className="py-16 bg-zinc-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold font-display text-zinc-100 mb-4"
            variants={fadeInUp}
          >
            Comment ça marche ?
          </motion.h2>
          <motion.p
            className="text-zinc-500 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Notre système de revente sécurisé vous permet d'acheter des billets en toute confiance
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorksSteps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              variants={cardVariants}
              custom={index}
            >
              <Card className="p-6 h-full text-center hover:shadow-lg transition-shadow">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="font-bold text-zinc-100 text-lg mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-sm">{step.description}</p>
              </Card>

              {/* Connector Line (hidden on mobile and last item) */}
              {index < howItWorksSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary-500/30 to-secondary-500/30" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function ResalePage() {
  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Get available categories from tickets
  const availableCategories = useMemo(() => {
    const categories = getResaleCategories();
    return categories.map((cat) => ({
      value: cat,
      label: categoryLabels[cat],
    }));
  }, []);

  // Price options
  const priceOptions = [
    { value: "25", label: "Jusqu'à 25 EUR" },
    { value: "50", label: "Jusqu'à 50 EUR" },
    { value: "75", label: "Jusqu'à 75 EUR" },
    { value: "100", label: "Jusqu'à 100 EUR" },
    { value: "150", label: "Jusqu'à 150 EUR" },
  ];

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return mockResaleTickets.filter((ticket) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = ticket.event.title.toLowerCase().includes(query);
        const matchVenue = ticket.event.venue?.name.toLowerCase().includes(query);
        const matchTicketType = ticket.ticketType.name.toLowerCase().includes(query);
        if (!matchTitle && !matchVenue && !matchTicketType) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && ticket.event.category !== selectedCategory) {
        return false;
      }

      // Price filter
      if (maxPrice && ticket.resalePrice > parseInt(maxPrice, 10)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, maxPrice]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (maxPrice) count++;
    return count;
  }, [selectedCategory, maxPrice]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("");
    setMaxPrice("");
  }, []);

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* ================================================================== */}
      {/* HEADER SECTION */}
      {/* ================================================================== */}
      <motion.header
        className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white py-16 md:py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Grain texture via subtle radial gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-zinc-800/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-primary-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ShieldCheck className="w-4 h-4 text-primary-300" />
              <span className="text-primary-300">100% sécurisé et garanti</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-zinc-100 mb-6">
              Revente de billets
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Trouvez des billets pour des événements complets. Achetez en toute sécurité
              auprès d'autres fans, à prix équitable.
            </p>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-zinc-100">{mockResaleTickets.length}</p>
                <p className="text-zinc-500 text-sm">Billets disponibles</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-zinc-100">
                  {new Set(mockResaleTickets.map((t) => t.event.id)).size}
                </p>
                <p className="text-zinc-500 text-sm">Événements</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-zinc-100">0%</p>
                <p className="text-zinc-500 text-sm">Commission</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* ================================================================== */}
      {/* FILTERS SECTION */}
      {/* ================================================================== */}
      <motion.section
        className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un événement, un lieu, un type de billet..."
                className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Selects */}
            <div className="flex flex-col sm:flex-row gap-3">
              <FilterSelect
                label="Catégorie"
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={availableCategories}
                icon={<Tag className="w-4 h-4" />}
              />
              <FilterSelect
                label="Prix max"
                value={maxPrice}
                onChange={setMaxPrice}
                options={priceOptions}
                icon={<CreditCard className="w-4 h-4" />}
              />

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Effacer ({activeFiltersCount})
                </motion.button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <motion.div
            className="mt-3 flex items-center justify-between text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-zinc-500">
              <span className="font-semibold text-zinc-100">{filteredTickets.length}</span>
              {" "}billet{filteredTickets.length !== 1 ? "s" : ""} disponible{filteredTickets.length !== 1 ? "s" : ""}
            </p>
            {searchQuery && (
              <p className="text-zinc-500">
                Résultats pour &quot;{searchQuery}&quot;
              </p>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* TICKETS GRID */}
      {/* ================================================================== */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {filteredTickets.length > 0 ? (
            <motion.div
              key="results"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredTickets.map((ticket) => (
                <ResaleTicketCard key={ticket.id} ticket={ticket} />
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
              <motion.div
                className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Ticket className="w-12 h-12 text-zinc-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2 text-center">
                Aucun billet trouvé
              </h2>
              <p className="text-zinc-500 text-center max-w-md mb-6">
                {searchQuery
                  ? `Aucun résultat pour "${searchQuery}". Essayez de modifier vos critères de recherche.`
                  : "Aucun billet ne correspond à vos filtres. Essayez d'ajuster vos critères."}
              </p>
              <Button onClick={clearFilters} variant="outline">
                <SlidersHorizontal className="w-4 h-4" />
                Réinitialiser les filtres
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ================================================================== */}
      {/* HOW IT WORKS SECTION */}
      {/* ================================================================== */}
      <HowItWorksSection />

      {/* ================================================================== */}
      {/* CTA SECTION */}
      {/* ================================================================== */}
      <motion.section
        className="py-16 bg-zinc-950"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-8 md:p-12 text-white text-center">
            <motion.div variants={fadeInUp}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Vous avez des billets à revendre ?
              </h2>
              <p className="text-white/90 max-w-xl mx-auto mb-6">
                Mettez vos billets en vente en quelques clics. C'est gratuit, sécurisé
                et vous récupérez votre argent rapidement.
              </p>
              <Link href="/account/tickets">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-secondary-600"
                >
                  Revendre mes billets
                </Button>
              </Link>
            </motion.div>
          </Card>
        </div>
      </motion.section>
    </div>
  );
}
