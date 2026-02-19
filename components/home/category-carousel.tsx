"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Music,
  Disc3,
  Drama,
  Laugh,
  Frame,
  Tent,
  Trophy,
  Film,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  hoverGradient: string;
}

const categories: Category[] = [
  {
    id: "concert",
    label: "Concert",
    icon: Music,
    gradient: "from-primary-500/10 to-primary-500/5",
    hoverGradient: "from-primary-500 to-primary-600",
  },
  {
    id: "club",
    label: "Club & DJ",
    icon: Disc3,
    gradient: "from-secondary-500/10 to-secondary-500/5",
    hoverGradient: "from-secondary-500 to-secondary-600",
  },
  {
    id: "theatre",
    label: "Théâtre",
    icon: Drama,
    gradient: "from-accent-500/10 to-accent-500/5",
    hoverGradient: "from-accent-500 to-accent-600",
  },
  {
    id: "comedie",
    label: "Comédie",
    icon: Laugh,
    gradient: "from-pink-500/10 to-pink-500/5",
    hoverGradient: "from-pink-500 to-pink-600",
  },
  {
    id: "exposition",
    label: "Exposition",
    icon: Frame,
    gradient: "from-cyan-500/10 to-cyan-500/5",
    hoverGradient: "from-cyan-500 to-cyan-600",
  },
  {
    id: "festival",
    label: "Festival",
    icon: Tent,
    gradient: "from-emerald-500/10 to-emerald-500/5",
    hoverGradient: "from-emerald-500 to-emerald-600",
  },
  {
    id: "sport",
    label: "Sport",
    icon: Trophy,
    gradient: "from-orange-500/10 to-orange-500/5",
    hoverGradient: "from-orange-500 to-orange-600",
  },
  {
    id: "cinema",
    label: "Cinéma",
    icon: Film,
    gradient: "from-indigo-500/10 to-indigo-500/5",
    hoverGradient: "from-indigo-500 to-indigo-600",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function CategoryCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);

      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Explorer par catégorie
            </h2>
            <p className="mt-2 text-gray-600">
              Trouvez les événements qui vous passionnent
            </p>
          </div>

          {/* Navigation Buttons - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "p-2.5 rounded-full border border-gray-200 bg-white transition-all duration-200",
                canScrollLeft
                  ? "hover:border-primary-500 hover:text-primary-500 hover:shadow-md cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              )}
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "p-2.5 rounded-full border border-gray-200 bg-white transition-all duration-200",
                canScrollRight
                  ? "hover:border-primary-500 hover:text-primary-500 hover:shadow-md cursor-pointer"
                  : "opacity-40 cursor-not-allowed"
              )}
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="relative">
          {/* Gradient Fade Left */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
              canScrollLeft ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Gradient Fade Right */}
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
              canScrollRight ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Scrollable Container */}
          <motion.div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <motion.div variants={itemVariants}>
      <Link
        href={`/search?category=${category.id}`}
        className="group block flex-shrink-0"
      >
        <motion.div
          className={cn(
            "relative w-32 sm:w-36 h-36 sm:h-40 rounded-2xl overflow-hidden",
            "bg-gradient-to-br",
            category.gradient,
            "border border-gray-100",
            "transition-colors duration-300"
          )}
          whileHover={{
            scale: 1.05,
            y: -8,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          {/* Hover Gradient Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              category.hoverGradient
            )}
          />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-4 z-10">
            {/* Icon Container */}
            <div
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-3",
                "bg-white/80 group-hover:bg-white/20 transition-colors duration-300",
                "shadow-sm group-hover:shadow-lg"
              )}
            >
              <Icon
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-300",
                  "text-gray-700 group-hover:text-white"
                )}
              />
            </div>

            {/* Label */}
            <span
              className={cn(
                "text-sm sm:text-base font-semibold text-center transition-colors duration-300",
                "text-gray-800 group-hover:text-white"
              )}
            >
              {category.label}
            </span>
          </div>

          {/* Decorative elements on hover */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
