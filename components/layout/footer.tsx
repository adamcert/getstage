import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, PartyPopper } from "lucide-react";

const footerLinks = {
  discover: [
    { href: "/search", label: "Explorer" },
    { href: "/search?category=concert", label: "Concerts" },
    { href: "/search?category=dj", label: "Clubs & DJ" },
    { href: "/search?category=theatre", label: "Théâtre" },
    { href: "/search?category=expo", label: "Expositions" },
  ],
  services: [
    { href: "/resale", label: "Revente de billets" },
    { href: "/gift-cards", label: "Cartes cadeaux" },
    { href: "/for-organizers", label: "Pour les organisateurs" },
    { href: "/pricing", label: "Tarifs" },
  ],
  support: [
    { href: "/help", label: "Centre d'aide" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  legal: [
    { href: "/terms", label: "CGU" },
    { href: "/privacy", label: "Confidentialité" },
    { href: "/cookies", label: "Cookies" },
  ],
};

const socialLinks = [
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
];

export function Footer() {
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
              Découvrez les meilleurs événements près de chez vous.
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
            <h4 className="font-display font-semibold mb-4">Découvrir</h4>
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
            <h4 className="font-display font-semibold mb-4">Services</h4>
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
            <h4 className="font-display font-semibold mb-4">Support</h4>
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
            <h4 className="font-display font-semibold mb-4">Legal</h4>
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
          <p>&copy; {new Date().getFullYear()} GetStage <span className="text-zinc-600">by SNAPSS</span>. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
