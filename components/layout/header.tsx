"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, ShoppingBag, Heart, PartyPopper, ChevronDown, Check } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCartStore, selectCartItemCount } from "@/stores/cart-store";
import { useTranslation, useLocale } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

const LANGUAGES: { code: Locale; flag: string; label: string; short: string }[] = [
  { code: "fr", flag: "🇫🇷", label: "Français", short: "FR" },
  { code: "en", flag: "🇬🇧", label: "English", short: "EN" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<any>(null); // TODO: Get from auth

  const { t } = useTranslation("header");
  const { locale, setLocale } = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on click outside
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/search", label: t("explore") },
    { href: "/resale", label: t("resale") },
    { href: "/gift-cards", label: t("giftCards") },
  ];

  // Cart store
  const itemCount = useCartStore(selectCartItemCount);
  const prevItemCountRef = useRef(itemCount);

  // Fix hydration mismatch - only show cart count after client mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Animate cart button when item count increases
  useEffect(() => {
    if (itemCount > prevItemCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevItemCountRef.current = itemCount;
  }, [itemCount]);

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display font-bold text-xl text-zinc-100 tracking-tight">GetStage</span>
              <span className="text-[10px] font-semibold text-zinc-500 tracking-widest uppercase self-end">by SNAPSS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-secondary-400 bg-secondary-500/10"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search button */}
            <Link href="/search">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="w-5 h-5" />
              </Button>
            </Link>

            {/* Favorites */}
            <Button variant="ghost" size="sm" className="relative">
              <Heart className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "relative",
                isAnimating && "animate-bounce"
              )}
              onClick={() => setIsCartOpen(true)}
              aria-label={t("openCart")}
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {isHydrated && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center",
                      isAnimating && "animate-pulse"
                    )}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* User menu */}
            {user ? (
              <Avatar
                src={user.avatar_url}
                alt={user.full_name}
                fallback={user.full_name}
                size="sm"
                className="cursor-pointer"
              />
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  {t("signIn")}
                </Button>
              </Link>
            )}

            {/* Language selector */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors border border-zinc-800 hover:border-zinc-700"
                aria-label="Change language"
                aria-expanded={langOpen}
              >
                <span className="text-sm leading-none">{currentLang.flag}</span>
                {currentLang.short}
                <ChevronDown className={cn("w-3 h-3 transition-transform", langOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-40 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl shadow-black/40 overflow-hidden z-50"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLocale(lang.code);
                          setLangOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors",
                          locale === lang.code
                            ? "text-zinc-100 bg-zinc-800/60"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
                        )}
                      >
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span className="font-medium">{lang.label}</span>
                        {locale === lang.code && (
                          <Check className="w-3.5 h-3.5 text-secondary-400 ml-auto" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-800 bg-zinc-950"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    pathname === link.href
                      ? "text-secondary-400 bg-zinc-900"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
