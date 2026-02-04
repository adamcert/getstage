"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  type: "history" | "popular" | "category";
}

// =============================================================================
// CONSTANTS
// =============================================================================

const POPULAR_SEARCHES: Suggestion[] = [
  { id: "pop-1", text: "Concert Paris", type: "popular" },
  { id: "pop-2", text: "DJ ce soir", type: "popular" },
  { id: "pop-3", text: "Theatre comedie", type: "popular" },
  { id: "pop-4", text: "Festival ete", type: "popular" },
  { id: "pop-5", text: "Exposition gratuite", type: "popular" },
];

const STORAGE_KEY = "event-search-history";
const MAX_HISTORY_ITEMS = 5;

// =============================================================================
// ANIMATIONS
// =============================================================================

const suggestionsVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.98,
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
    scale: 0.98,
    transition: {
      duration: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSearchHistory(): Suggestion[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const history = JSON.parse(stored) as string[];
    return history.map((text, index) => ({
      id: `history-${index}`,
      text,
      type: "history" as const,
    }));
  } catch {
    return [];
  }
}

function saveSearchHistory(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history = stored ? (JSON.parse(stored) as string[]) : [];
    const newHistory = [
      query.trim(),
      ...history.filter((item) => item.toLowerCase() !== query.trim().toLowerCase()),
    ].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch {
    // Ignore storage errors
  }
}

function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

// =============================================================================
// SEARCH INPUT COMPONENT
// =============================================================================

export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Rechercher un evenement, un artiste, un lieu...",
  className,
  autoFocus = false,
  showSuggestions = true,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load search history on mount
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  // Filter suggestions based on input
  const filteredSuggestions = useCallback(() => {
    const query = value.toLowerCase().trim();

    if (!query) {
      // Show history and popular when empty
      return [...history, ...POPULAR_SEARCHES.slice(0, 5 - history.length)];
    }

    // Filter matching suggestions
    const matchingHistory = history.filter((s) =>
      s.text.toLowerCase().includes(query)
    );
    const matchingPopular = POPULAR_SEARCHES.filter(
      (s) =>
        s.text.toLowerCase().includes(query) &&
        !matchingHistory.some((h) => h.text.toLowerCase() === s.text.toLowerCase())
    );

    return [...matchingHistory, ...matchingPopular].slice(0, 6);
  }, [value, history]);

  const suggestions = filteredSuggestions();
  const showDropdown = isFocused && showSuggestions && suggestions.length > 0;

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [value]);

  const handleSubmit = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      saveSearchHistory(query);
      setHistory(getSearchHistory());
      onSubmit?.(query);
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) {
        if (e.key === "Enter") {
          handleSubmit(value);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            onChange(suggestions[selectedIndex].text);
            handleSubmit(suggestions[selectedIndex].text);
          } else {
            handleSubmit(value);
          }
          break;
        case "Escape":
          setIsFocused(false);
          inputRef.current?.blur();
          break;
      }
    },
    [showDropdown, suggestions, selectedIndex, value, onChange, handleSubmit]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      onChange(suggestion.text);
      handleSubmit(suggestion.text);
    },
    [onChange, handleSubmit]
  );

  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  const handleClearHistory = useCallback(() => {
    clearSearchHistory();
    setHistory([]);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Input Container */}
      <div
        className={cn(
          "relative flex items-center w-full rounded-2xl border bg-white transition-all duration-200",
          isFocused
            ? "border-primary-500 ring-4 ring-primary-500/10 shadow-lg"
            : "border-gray-200 hover:border-gray-300 shadow-sm"
        )}
      >
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search
            className={cn(
              "w-5 h-5 transition-colors duration-200",
              isFocused ? "text-primary-500" : "text-gray-400"
            )}
          />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "w-full py-4 pl-12 pr-12 bg-transparent outline-none",
            "text-gray-900 placeholder:text-gray-400",
            "text-base"
          )}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 py-2 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden"
            variants={suggestionsVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* History Section */}
            {history.length > 0 && !value && (
              <div className="px-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Recherches recentes
                  </span>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
                  >
                    Effacer tout
                  </button>
                </div>
              </div>
            )}

            {/* Popular Section Header (only when no value) */}
            {!value && history.length === 0 && (
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Recherches populaires
                </span>
              </div>
            )}

            {/* Suggestions List */}
            <div className="space-y-0.5">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    index === selectedIndex
                      ? "bg-primary-50 text-primary-700"
                      : "hover:bg-gray-50"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 p-2 rounded-lg",
                      suggestion.type === "history"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-primary-50 text-primary-500"
                    )}
                  >
                    {suggestion.type === "history" ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                  </div>

                  {/* Text */}
                  <span className="flex-1 font-medium text-gray-700">
                    {highlightMatch(suggestion.text, value)}
                  </span>

                  {/* Arrow */}
                  <ArrowRight
                    className={cn(
                      "w-4 h-4 text-gray-300 transition-colors",
                      index === selectedIndex && "text-primary-500"
                    )}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// HIGHLIGHT HELPER
// =============================================================================

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegExp(query.trim())})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className="text-primary-600 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// =============================================================================
// COMPACT SEARCH INPUT (FOR HEADER)
// =============================================================================

interface CompactSearchInputProps {
  onExpand?: () => void;
  className?: string;
}

export function CompactSearchInput({ onExpand, className }: CompactSearchInputProps) {
  return (
    <button
      onClick={onExpand}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white",
        "text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50",
        "transition-all duration-200",
        className
      )}
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Rechercher...</span>
    </button>
  );
}
