"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Search, MapPin, Tag, Sparkles, Calendar, Gift, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const cities = [
  { value: "", label: "Toutes les villes" },
  { value: "paris", label: "Paris" },
  { value: "lyon", label: "Lyon" },
  { value: "marseille", label: "Marseille" },
  { value: "bordeaux", label: "Bordeaux" },
  { value: "toulouse", label: "Toulouse" },
  { value: "lille", label: "Lille" },
  { value: "nice", label: "Nice" },
  { value: "nantes", label: "Nantes" },
  { value: "strasbourg", label: "Strasbourg" },
];

const categories = [
  { value: "", label: "Toutes catégories" },
  { value: "concerts", label: "Concerts" },
  { value: "clubs", label: "Clubs & Soirées" },
  { value: "theatre", label: "Théâtre" },
  { value: "spectacles", label: "Spectacles" },
  { value: "festivals", label: "Festivals" },
  { value: "sport", label: "Sport" },
  { value: "expositions", label: "Expositions" },
  { value: "comedie", label: "Comédie" },
];

const quickFilters = [
  { id: "tonight", label: "Ce soir", icon: Flame },
  { id: "weekend", label: "Ce week-end", icon: Calendar },
  { id: "free", label: "Gratuit", icon: Gift },
  { id: "new", label: "Nouveautés", icon: Sparkles },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

const searchBarVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.4,
    },
  },
};

const quickFilterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      delay: 0.7 + i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log({ searchQuery, selectedCity, selectedCategory, activeQuickFilter });
  };

  const handleQuickFilter = (filterId: string) => {
    setActiveQuickFilter(activeQuickFilter === filterId ? null : filterId);
  };

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Immersive Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Gradient overlay from bottom for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Subtle animated color accent */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-secondary-900/30"
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title & Subtitle */}
        <div className="text-center mb-10">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight"
            variants={itemVariants}
          >
            Découvrez les meilleurs{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300">
              événements
            </span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Concerts, clubs, théâtre et plus encore près de chez vous
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-3 sm:p-4"
          variants={searchBarVariants}
        >
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement, artiste, lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-200 placeholder:text-gray-400"
              />
            </div>

            {/* City Select */}
            <div className="relative lg:w-48">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-12 pr-8 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-200 appearance-none cursor-pointer text-gray-700"
              >
                {cities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Category Select */}
            <div className="relative lg:w-48">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-8 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-200 appearance-none cursor-pointer text-gray-700"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="lg:w-auto whitespace-nowrap"
              leftIcon={<Search className="w-5 h-5" />}
            >
              Rechercher
            </Button>
          </div>
        </motion.form>

        {/* Quick Filters */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {quickFilters.map((filter, index) => {
            const Icon = filter.icon;
            const isActive = activeQuickFilter === filter.id;

            return (
              <motion.button
                key={filter.id}
                type="button"
                onClick={() => handleQuickFilter(filter.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200",
                  isActive
                    ? "bg-white text-primary-600 shadow-lg"
                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                )}
                variants={quickFilterVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </motion.button>
            );
          })}
        </div>

        {/* Stats or Social Proof (optional decorative element) */}
        <motion.div
          className="flex justify-center items-center gap-8 mt-10 text-white/70 text-sm"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">10K+</span>
            <span>événements</span>
          </div>
          <div className="w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">50+</span>
            <span>villes</span>
          </div>
          <div className="w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">100K+</span>
            <span>utilisateurs</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
