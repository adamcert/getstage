"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Twitter, Facebook, Youtube, PartyPopper } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

const socialLinks = [
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
];

export function Footer() {
  const pathname = usePathname();
  const { t } = useTranslation("footer");
  const { t: tCat } = useTranslation("categories");
  const { t: tHeader } = useTranslation("header");

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/scan") ||
    pathname.startsWith("/t/")
  ) return null;

  const footerLinks = {
    discover: [
      { href: "/search", label: tHeader("explore") },
      { href: "/search?category=concert", label: tCat("concerts") },
      { href: "/search?category=dj", label: tCat("dj") },
      { href: "/search?category=theatre", label: tCat("theatre") },
      { href: "/search?category=expo", label: tCat("expos") },
    ],
    services: [
      { href: "/corporate", label: t("corporateEvents") },
      { href: "/gift-cards", label: tHeader("giftCards") },
      { href: "/for-organizers", label: t("forOrganizers") },
      { href: "/pricing", label: t("pricing") },
    ],
    support: [
      { href: "/help", label: t("helpCenter") },
      { href: "/contact", label: t("contact") },
      { href: "/faq", label: "FAQ" },
    ],
    legal: [
      { href: "/terms", label: t("terms") },
      { href: "/privacy", label: t("privacy") },
      { href: "/cookies", label: t("cookies") },
    ],
  };

  return (
    <footer className="bg-zinc-950 text-white">
      {/* Gradient line at top */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <PartyPopper className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-lg tracking-tight">GetStage</span>
                <span className="text-[10px] font-semibold text-zinc-600 tracking-widest uppercase">by SNAPSS</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm mb-4">
              {t("tagline")}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("discover")}</h4>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-500 hover:text-zinc-100 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("services")}</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-500 hover:text-zinc-100 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("support")}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-500 hover:text-zinc-100 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("legal")}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-500 hover:text-zinc-100 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-zinc-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GetStage <span className="text-zinc-600">by SNAPSS</span>. {t("allRights")}</p>
        </div>
      </div>
    </footer>
  );
}
