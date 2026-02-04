"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Filter,
  X,
  ChevronDown,
  Calendar,
  MapPin,
  Tag,
  Euro,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventCategory, EventFilters } from "@/types/database";

// =============================================================================
// TYPES
// =============================================================================

interface FiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  className?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CATEGORIES: FilterOption[] = [
  { value: "concert", label: "Concert" },
  { value: "dj", label: "DJ & Club" },
  { value: "theatre", label: "Theatre" },
  { value: "comedy", label: "Comedie" },
  { value: "expo", label: "Exposition" },
  { value: "film", label: "Cinema" },
  { value: "party", label: "Soiree" },
  { value: "festival", label: "Festival" },
  { value: "other", label: "Autre" },
];

const CITIES: FilterOption[] = [
  { value: "paris", label: "Paris" },
  { value: "lyon", label: "Lyon" },
  { value: "marseille", label: "Marseille" },
  { value: "bordeaux", label: "Bordeaux" },
  { value: "lille", label: "Lille" },
  { value: "toulouse", label: "Toulouse" },
  { value: "nice", label: "Nice" },
  { value: "nantes", label: "Nantes" },
  { value: "strasbourg", label: "Strasbourg" },
  { value: "montpellier", label: "Montpellier" },
];

const PRICE_RANGES: FilterOption[] = [
  { value: "free", label: "Gratuit" },
  { value: "0-20", label: "0 - 20 EUR" },
  { value: "20-50", label: "20 - 50 EUR" },
  { value: "50+", label: "50 EUR+" },
];

type DatePreset = "tonight" | "tomorrow" | "weekend" | "custom";

// =============================================================================
// ANIMATIONS
// =============================================================================

const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

const sheetVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.25,
    },
  },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDateRange(preset: DatePreset): { from: string; to: string } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "tonight": {
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return {
        from: now.toISOString(),
        to: endOfDay.toISOString(),
      };
    }
    case "tomorrow": {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);
      return {
        from: tomorrow.toISOString(),
        to: endOfTomorrow.toISOString(),
      };
    }
    case "weekend": {
      const dayOfWeek = today.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + daysUntilSaturday);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      sunday.setHours(23, 59, 59, 999);
      return {
        from: saturday.toISOString(),
        to: sunday.toISOString(),
      };
    }
    default:
      return null;
  }
}

function parsePriceRange(range: string): { min?: number; max?: number; isFree?: boolean } {
  switch (range) {
    case "free":
      return { isFree: true };
    case "0-20":
      return { min: 0, max: 20 };
    case "20-50":
      return { min: 20, max: 50 };
    case "50+":
      return { min: 50 };
    default:
      return {};
  }
}

// =============================================================================
// DROPDOWN COMPONENT
// =============================================================================

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  align?: "left" | "right";
}

function Dropdown({ trigger, children, isOpen, onOpenChange, align = "left" }: DropdownProps) {
  return (
    <div className="relative">
      <div onClick={() => onOpenChange(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => onOpenChange(false)}
            />
            <motion.div
              className={cn(
                "absolute top-full mt-2 z-50 min-w-[200px] py-2 bg-white rounded-xl shadow-xl border border-gray-100",
                align === "right" ? "right-0" : "left-0"
              )}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// FILTER BUTTON COMPONENT
// =============================================================================

interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

function FilterButton({ icon, label, value, isActive, onClick, className }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200",
        "text-sm font-medium whitespace-nowrap",
        isActive
          ? "border-primary-500 bg-primary-50 text-primary-700"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
        className
      )}
    >
      <span className={cn("transition-colors", isActive ? "text-primary-500" : "text-gray-400")}>
        {icon}
      </span>
      <span>{value || label}</span>
      <ChevronDown className={cn("w-4 h-4 transition-colors", isActive ? "text-primary-500" : "text-gray-400")} />
    </button>
  );
}

// =============================================================================
// FILTER BAR COMPONENT (DESKTOP)
// =============================================================================

export function FilterBar({ filters, onFiltersChange, className }: FiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.city) count++;
    if (filters.dateFrom || filters.dateTo || filters.isTonight) count++;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined || filters.isFree) count++;
    return count;
  }, [filters]);

  const handleCategoryChange = useCallback(
    (category: EventCategory | undefined) => {
      onFiltersChange({ ...filters, category });
      setOpenDropdown(null);
    },
    [filters, onFiltersChange]
  );

  const handleCityChange = useCallback(
    (city: string | undefined) => {
      onFiltersChange({ ...filters, city });
      setOpenDropdown(null);
    },
    [filters, onFiltersChange]
  );

  const handleDateChange = useCallback(
    (preset: DatePreset) => {
      if (preset === "tonight") {
        onFiltersChange({
          ...filters,
          isTonight: true,
          dateFrom: undefined,
          dateTo: undefined,
        });
      } else {
        const range = getDateRange(preset);
        onFiltersChange({
          ...filters,
          isTonight: false,
          dateFrom: range?.from,
          dateTo: range?.to,
        });
      }
      setOpenDropdown(null);
    },
    [filters, onFiltersChange]
  );

  const handlePriceChange = useCallback(
    (range: string | undefined) => {
      if (!range) {
        onFiltersChange({
          ...filters,
          priceMin: undefined,
          priceMax: undefined,
          isFree: undefined,
        });
      } else {
        const { min, max, isFree } = parsePriceRange(range);
        onFiltersChange({
          ...filters,
          priceMin: min,
          priceMax: max,
          isFree,
        });
      }
      setOpenDropdown(null);
    },
    [filters, onFiltersChange]
  );

  const resetFilters = useCallback(() => {
    onFiltersChange({});
    setOpenDropdown(null);
  }, [onFiltersChange]);

  const getSelectedCategoryLabel = () => {
    return CATEGORIES.find((c) => c.value === filters.category)?.label;
  };

  const getSelectedCityLabel = () => {
    return CITIES.find((c) => c.value === filters.city)?.label;
  };

  const getSelectedDateLabel = () => {
    if (filters.isTonight) return "Ce soir";
    if (filters.dateFrom) {
      const date = new Date(filters.dateFrom);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (date.toDateString() === tomorrow.toDateString()) return "Demain";
      return "Ce week-end";
    }
    return undefined;
  };

  const getSelectedPriceLabel = () => {
    if (filters.isFree) return "Gratuit";
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      return `${filters.priceMin} - ${filters.priceMax} EUR`;
    }
    if (filters.priceMin !== undefined) return `${filters.priceMin} EUR+`;
    return undefined;
  };

  return (
    <div className={cn("hidden md:flex items-center gap-3 flex-wrap", className)}>
      {/* Category Filter */}
      <Dropdown
        trigger={
          <FilterButton
            icon={<Tag className="w-4 h-4" />}
            label="Categorie"
            value={getSelectedCategoryLabel()}
            isActive={!!filters.category}
          />
        }
        isOpen={openDropdown === "category"}
        onOpenChange={(open) => setOpenDropdown(open ? "category" : null)}
      >
        <div className="px-2">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
              !filters.category ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50"
            )}
          >
            <span className="flex-1">Toutes les categories</span>
            {!filters.category && <Check className="w-4 h-4 text-primary-500" />}
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value as EventCategory)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                filters.category === category.value
                  ? "bg-primary-50 text-primary-700"
                  : "hover:bg-gray-50"
              )}
            >
              <span className="flex-1">{category.label}</span>
              {filters.category === category.value && <Check className="w-4 h-4 text-primary-500" />}
            </button>
          ))}
        </div>
      </Dropdown>

      {/* City Filter */}
      <Dropdown
        trigger={
          <FilterButton
            icon={<MapPin className="w-4 h-4" />}
            label="Ville"
            value={getSelectedCityLabel()}
            isActive={!!filters.city}
          />
        }
        isOpen={openDropdown === "city"}
        onOpenChange={(open) => setOpenDropdown(open ? "city" : null)}
      >
        <div className="px-2 max-h-[300px] overflow-y-auto">
          <button
            onClick={() => handleCityChange(undefined)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
              !filters.city ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50"
            )}
          >
            <span className="flex-1">Toutes les villes</span>
            {!filters.city && <Check className="w-4 h-4 text-primary-500" />}
          </button>
          {CITIES.map((city) => (
            <button
              key={city.value}
              onClick={() => handleCityChange(city.value)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                filters.city === city.value
                  ? "bg-primary-50 text-primary-700"
                  : "hover:bg-gray-50"
              )}
            >
              <span className="flex-1">{city.label}</span>
              {filters.city === city.value && <Check className="w-4 h-4 text-primary-500" />}
            </button>
          ))}
        </div>
      </Dropdown>

      {/* Date Filter */}
      <Dropdown
        trigger={
          <FilterButton
            icon={<Calendar className="w-4 h-4" />}
            label="Date"
            value={getSelectedDateLabel()}
            isActive={!!(filters.dateFrom || filters.isTonight)}
          />
        }
        isOpen={openDropdown === "date"}
        onOpenChange={(open) => setOpenDropdown(open ? "date" : null)}
      >
        <div className="px-2">
          <button
            onClick={() =>
              onFiltersChange({
                ...filters,
                isTonight: false,
                dateFrom: undefined,
                dateTo: undefined,
              })
            }
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
              !filters.dateFrom && !filters.isTonight
                ? "bg-primary-50 text-primary-700"
                : "hover:bg-gray-50"
            )}
          >
            <span className="flex-1">Toutes les dates</span>
            {!filters.dateFrom && !filters.isTonight && <Check className="w-4 h-4 text-primary-500" />}
          </button>
          <button
            onClick={() => handleDateChange("tonight")}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
              filters.isTonight ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50"
            )}
          >
            <span className="flex-1">Ce soir</span>
            {filters.isTonight && <Check className="w-4 h-4 text-primary-500" />}
          </button>
          <button
            onClick={() => handleDateChange("tomorrow")}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
              getSelectedDateLabel() === "Demain" ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50"
            )}
          >
            <span className="flex-1">Demain</span>
            {getSelectedDateLabel() === "Demain" && <Check className="w-4 h-4 text-primary-500" />}
          </button>
          <button
            onClick={() => handleDateChange("weekend")}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
              getSelectedDateLabel() === "Ce week-end"
                ? "bg-primary-50 text-primary-700"
                : "hover:bg-gray-50"
            )}
          >
            <span className="flex-1">Ce week-end</span>
            {getSelectedDateLabel() === "Ce week-end" && <Check className="w-4 h-4 text-primary-500" />}
          </button>
        </div>
      </Dropdown>

      {/* Price Filter */}
      <Dropdown
        trigger={
          <FilterButton
            icon={<Euro className="w-4 h-4" />}
            label="Prix"
            value={getSelectedPriceLabel()}
            isActive={!!(filters.priceMin !== undefined || filters.priceMax !== undefined || filters.isFree)}
          />
        }
        isOpen={openDropdown === "price"}
        onOpenChange={(open) => setOpenDropdown(open ? "price" : null)}
      >
        <div className="px-2">
          <button
            onClick={() => handlePriceChange(undefined)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
              !filters.priceMin && !filters.priceMax && !filters.isFree
                ? "bg-primary-50 text-primary-700"
                : "hover:bg-gray-50"
            )}
          >
            <span className="flex-1">Tous les prix</span>
            {!filters.priceMin && !filters.priceMax && !filters.isFree && (
              <Check className="w-4 h-4 text-primary-500" />
            )}
          </button>
          {PRICE_RANGES.map((range) => {
            const isSelected =
              (range.value === "free" && filters.isFree) ||
              (range.value === "0-20" && filters.priceMin === 0 && filters.priceMax === 20) ||
              (range.value === "20-50" && filters.priceMin === 20 && filters.priceMax === 50) ||
              (range.value === "50+" && filters.priceMin === 50 && filters.priceMax === undefined);

            return (
              <button
                key={range.value}
                onClick={() => handlePriceChange(range.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  isSelected ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50"
                )}
              >
                <span className="flex-1">{range.label}</span>
                {isSelected && <Check className="w-4 h-4 text-primary-500" />}
              </button>
            );
          })}
        </div>
      </Dropdown>

      {/* Active Filters Badge & Reset */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Badge variant="hot" className="px-3 py-1">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? "s" : ""}
            </Badge>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reinitialiser
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// FILTER SHEET COMPONENT (MOBILE)
// =============================================================================

interface FilterSheetProps extends FiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSheet({ filters, onFiltersChange, isOpen, onClose }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.city) count++;
    if (localFilters.dateFrom || localFilters.dateTo || localFilters.isTonight) count++;
    if (localFilters.priceMin !== undefined || localFilters.priceMax !== undefined || localFilters.isFree) count++;
    return count;
  }, [localFilters]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleDatePreset = (preset: DatePreset) => {
    if (preset === "tonight") {
      setLocalFilters({
        ...localFilters,
        isTonight: true,
        dateFrom: undefined,
        dateTo: undefined,
      });
    } else {
      const range = getDateRange(preset);
      setLocalFilters({
        ...localFilters,
        isTonight: false,
        dateFrom: range?.from,
        dateTo: range?.to,
      });
    }
  };

  const handlePricePreset = (range: string) => {
    const { min, max, isFree } = parsePriceRange(range);
    setLocalFilters({
      ...localFilters,
      priceMin: min,
      priceMax: max,
      isFree,
    });
  };

  // Sync local filters when sheet opens
  const handleAnimationComplete = () => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={handleAnimationComplete}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Filtres</h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="hot" className="px-2 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-4 py-6 space-y-8" style={{ maxHeight: "calc(85vh - 180px)" }}>
              {/* Category Section */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  Categorie
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setLocalFilters({ ...localFilters, category: undefined })}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      !localFilters.category
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Toutes
                  </button>
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() =>
                        setLocalFilters({
                          ...localFilters,
                          category: category.value as EventCategory,
                        })
                      }
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        localFilters.category === category.value
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Section */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Ville
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setLocalFilters({ ...localFilters, city: undefined })}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      !localFilters.city
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Toutes
                  </button>
                  {CITIES.map((city) => (
                    <button
                      key={city.value}
                      onClick={() => setLocalFilters({ ...localFilters, city: city.value })}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        localFilters.city === city.value
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Section */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Date
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setLocalFilters({
                        ...localFilters,
                        isTonight: false,
                        dateFrom: undefined,
                        dateTo: undefined,
                      })
                    }
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      !localFilters.dateFrom && !localFilters.isTonight
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => handleDatePreset("tonight")}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      localFilters.isTonight
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Ce soir
                  </button>
                  <button
                    onClick={() => handleDatePreset("tomorrow")}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      !localFilters.isTonight && localFilters.dateFrom
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Demain
                  </button>
                  <button
                    onClick={() => handleDatePreset("weekend")}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Ce week-end
                  </button>
                </div>
              </div>

              {/* Price Section */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <Euro className="w-4 h-4 text-gray-400" />
                  Prix
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setLocalFilters({
                        ...localFilters,
                        priceMin: undefined,
                        priceMax: undefined,
                        isFree: undefined,
                      })
                    }
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      !localFilters.priceMin && !localFilters.priceMax && !localFilters.isFree
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    Tous
                  </button>
                  {PRICE_RANGES.map((range) => {
                    const isSelected =
                      (range.value === "free" && localFilters.isFree) ||
                      (range.value === "0-20" && localFilters.priceMin === 0 && localFilters.priceMax === 20) ||
                      (range.value === "20-50" && localFilters.priceMin === 20 && localFilters.priceMax === 50) ||
                      (range.value === "50+" && localFilters.priceMin === 50 && !localFilters.priceMax);

                    return (
                      <button
                        key={range.value}
                        onClick={() => handlePricePreset(range.value)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all",
                          isSelected
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reinitialiser
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleApply}>
                Appliquer{activeFiltersCount > 0 && ` (${activeFiltersCount})`}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// MOBILE FILTER TRIGGER BUTTON
// =============================================================================

interface FilterTriggerProps {
  activeCount: number;
  onClick: () => void;
  className?: string;
}

export function FilterTrigger({ activeCount, onClick, className }: FilterTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200",
        "text-sm font-medium",
        activeCount > 0
          ? "border-primary-500 bg-primary-50 text-primary-700"
          : "border-gray-200 bg-white text-gray-700",
        className
      )}
    >
      <Filter className={cn("w-4 h-4", activeCount > 0 ? "text-primary-500" : "text-gray-400")} />
      <span>Filtres</span>
      {activeCount > 0 && (
        <Badge variant="hot" className="px-2 py-0.5 text-xs ml-1">
          {activeCount}
        </Badge>
      )}
    </button>
  );
}
