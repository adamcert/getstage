"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import {
  Ticket,
  Users,
  BarChart3,
  QrCode,
  Palette,
  UserPlus,
  ArrowRight,
  ArrowUpRight,
  Zap,
  Check,
  Sparkles,
  Star,
  Building2,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

// ─── Animation Variants ───────────────────────────────────────────

const blurUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const lineGrow: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Data ─────────────────────────────────────────────────────────

const features = [
  { key: "ticketing" as const, descKey: "ticketingDesc" as const, icon: Ticket, accent: "text-rose-400", glow: "bg-rose-500/20", border: "group-hover:border-rose-500/30" },
  { key: "crm" as const, descKey: "crmDesc" as const, icon: Users, accent: "text-violet-400", glow: "bg-violet-500/20", border: "group-hover:border-violet-500/30" },
  { key: "analyticsFeature" as const, descKey: "analyticsDesc" as const, icon: BarChart3, accent: "text-sky-400", glow: "bg-sky-500/20", border: "group-hover:border-sky-500/30" },
  { key: "scanning" as const, descKey: "scanningDesc" as const, icon: QrCode, accent: "text-emerald-400", glow: "bg-emerald-500/20", border: "group-hover:border-emerald-500/30" },
  { key: "customization" as const, descKey: "customizationDesc" as const, icon: Palette, accent: "text-amber-400", glow: "bg-amber-500/20", border: "group-hover:border-amber-500/30" },
  { key: "teamwork" as const, descKey: "teamworkDesc" as const, icon: UserPlus, accent: "text-fuchsia-400", glow: "bg-fuchsia-500/20", border: "group-hover:border-fuchsia-500/30" },
];

const steps = [
  { key: "step1" as const, descKey: "step1Desc" as const, num: "01", icon: Sparkles },
  { key: "step2" as const, descKey: "step2Desc" as const, num: "02", icon: Zap },
  { key: "step3" as const, descKey: "step3Desc" as const, num: "03", icon: Check },
];

const stats = [
  { value: "500+", label: "Organisateurs" },
  { value: "10K+", label: "Événements" },
  { value: "2M+", label: "Billets vendus" },
  { value: "99.9%", label: "Uptime" },
];

// ─── Dot Grid Pattern ─────────────────────────────────────────────

function DotGrid({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function ProPage() {
  const { t } = useTranslation("pro");

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 overflow-hidden">
      {/* ═══════════════ HERO ═══════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center pt-16"
      >
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-[15%] left-[15%] w-[600px] h-[600px] rounded-full bg-primary-500/15 blur-[180px]"
            animate={{
              x: [0, 60, -30, 0],
              y: [0, -40, 30, 0],
              scale: [1, 1.2, 0.95, 1],
            }}
            transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-secondary-500/12 blur-[180px]"
            animate={{
              x: [0, -50, 40, 0],
              y: [0, 40, -50, 0],
              scale: [1, 0.85, 1.15, 1],
            }}
            transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-fuchsia-500/8 blur-[120px]"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          />
        </div>

        {/* Dot grid overlay */}
        <DotGrid className="absolute inset-0 opacity-40" />

        {/* Top gradient fade from header */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#050507] to-transparent z-[1]" />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            {/* Badge */}
            <motion.div variants={blurUp} custom={0} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-zinc-300 tracking-wide">
                  {t("heroSubtitle")}
                </span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={blurUp}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-extrabold tracking-[-0.04em] leading-[0.95]"
            >
              <span className="block text-zinc-100">{t("heroTitle")}</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={blurUp}
              custom={2}
              className="mt-8 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
              {t("heroDesc")}
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={blurUp}
              custom={3}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative"
                >
                  {/* Glow behind button */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 opacity-40 blur-lg group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg">
                    {t("contactUs")}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.div variants={blurUp} custom={4} className="mt-14">
              <p className="text-sm text-zinc-600 mb-6">{t("trustedBy")}</p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + i * 0.1, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-200">
                      {stat.value}
                    </div>
                    <div className="text-xs text-zinc-600 mt-1 tracking-wider uppercase">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050507] to-transparent z-[1]" />
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="relative py-28 sm:py-36">
        {/* Section accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={blurUp} custom={0}>
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary-400 mb-4">
                Features
              </span>
            </motion.div>
            <motion.h2
              variants={blurUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-[-0.03em]"
            >
              {t("featuresTitle")}
            </motion.h2>
            <motion.p
              variants={blurUp}
              custom={2}
              className="mt-5 text-zinc-500 text-lg max-w-xl mx-auto"
            >
              {t("featuresSubtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.key}
                  variants={scaleIn}
                  className={`group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm p-7 transition-all duration-500 hover:-translate-y-1 ${feature.border}`}
                >
                  {/* Hover glow */}
                  <div
                    className={`absolute -inset-px rounded-2xl ${feature.glow} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 pointer-events-none`}
                  />

                  <div className="relative">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5 group-hover:border-white/[0.12] transition-colors duration-300`}>
                      <Icon className={`w-5 h-5 ${feature.accent}`} />
                    </div>

                    <h3 className="text-base font-semibold text-zinc-200 mb-2 tracking-tight">
                      {t(feature.key)}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="relative py-28 sm:py-36">
        <DotGrid className="absolute inset-0 opacity-20" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={blurUp} custom={0}>
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-secondary-400 mb-4">
                Process
              </span>
            </motion.div>
            <motion.h2
              variants={blurUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-[-0.03em]"
            >
              {t("howTitle")}
            </motion.h2>
            <motion.p
              variants={blurUp}
              custom={2}
              className="mt-5 text-zinc-500 text-lg max-w-xl mx-auto"
            >
              {t("howSubtitle")}
            </motion.p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line (desktop) */}
            <motion.div
              className="hidden sm:block absolute left-[39px] top-0 bottom-0 w-px origin-top"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={lineGrow}
            >
              <div className="w-full h-full bg-gradient-to-b from-primary-500/50 via-secondary-500/50 to-fuchsia-500/50" />
            </motion.div>

            <motion.div
              className="space-y-6 sm:space-y-0"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
            >
              {steps.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={step.key}
                    variants={blurUp}
                    custom={i}
                    className="relative flex gap-6 sm:gap-10 sm:py-10"
                  >
                    {/* Step number circle */}
                    <div className="relative z-10 shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <span className="text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-zinc-400 to-zinc-600">
                          {step.num}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6 sm:pb-0">
                      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-3">
                          <StepIcon className="w-5 h-5 text-primary-400" />
                          <h3 className="text-xl font-bold tracking-tight">
                            {t(step.key)}
                          </h3>
                        </div>
                        <p className="text-zinc-500 leading-relaxed">
                          {t(step.descKey)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="relative py-28 sm:py-36 scroll-mt-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={blurUp} custom={0}>
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-fuchsia-400 mb-4">
                Pricing
              </span>
            </motion.div>
            <motion.h2
              variants={blurUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-[-0.03em]"
            >
              {t("pricingTitle")}
            </motion.h2>
            <motion.p
              variants={blurUp}
              custom={2}
              className="mt-5 text-zinc-500 text-lg max-w-xl mx-auto"
            >
              {t("pricingSubtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-3 gap-5 items-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {/* ── Free ── */}
            <motion.div
              variants={scaleIn}
              className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm p-8 flex flex-col transition-all duration-500 hover:-translate-y-1 hover:border-zinc-700/80"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold tracking-tight">{t("freeName")}</h3>
                <p className="text-sm text-zinc-500 mt-1">{t("freeDesc")}</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-display font-extrabold tracking-tight">{t("freePrice")}</span>
              </div>
              <ul className="space-y-3.5 mb-8 flex-1">
                {(["freeF1", "freeF2", "freeF3", "freeF4", "freeF5"] as const).map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                    {t(f)}
                  </li>
                ))}
              </ul>
              {/* Commission badge */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-6">
                <Percent className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-amber-400/90">{t("freeCommission")}</span>
              </div>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full">
                  {t("choosePlan")}
                </Button>
              </Link>
            </motion.div>

            {/* ── Pro (Recommended) ── */}
            <motion.div
              variants={scaleIn}
              className="group relative rounded-2xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-1"
            >
              {/* Glow border */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary-500/40 via-primary-500/10 to-secondary-500/40 opacity-100" />
              <div className="absolute inset-0 rounded-2xl bg-zinc-900/90 backdrop-blur-sm" />

              {/* Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold shadow-lg shadow-primary-500/25">
                  <Star className="w-3 h-3" />
                  {t("recommended")}
                </span>
              </div>

              <div className="relative z-10">
                <div className="mb-6">
                  <h3 className="text-xl font-bold tracking-tight">{t("proName")}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{t("proDesc")}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-display font-extrabold tracking-tight">{t("proPrice")}</span>
                  <span className="text-zinc-500 text-base ml-1">{t("perMonth")}</span>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {(["proF1", "proF2", "proF3", "proF4", "proF5", "proF6"] as const).map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                      {t(f)}
                    </li>
                  ))}
                </ul>
                {/* Commission badge */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
                  <Percent className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-emerald-400/90">{t("proCommission")}</span>
                </div>
                <Link href="/contact">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="primary" size="lg" className="w-full">
                      {t("contactUs")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* ── Plus ── */}
            <motion.div
              variants={scaleIn}
              className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm p-8 flex flex-col transition-all duration-500 hover:-translate-y-1 hover:border-secondary-500/30"
            >
              {/* Hover glow */}
              <div className="absolute -inset-px rounded-2xl bg-secondary-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 pointer-events-none" />

              <div className="relative">
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight">{t("plusName")}</h3>
                    <Building2 className="w-4.5 h-4.5 text-secondary-400" />
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">{t("plusDesc")}</p>
                </div>
                <div className="mb-8">
                  <span className="text-4xl font-display font-extrabold tracking-tight text-zinc-300">Sur mesure</span>
                </div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  {(["plusF1", "plusF2", "plusF3", "plusF4", "plusF5", "plusF6"] as const).map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-secondary-400 shrink-0 mt-0.5" />
                      {t(f)}
                    </li>
                  ))}
                </ul>
                {/* Commission badge */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
                  <Percent className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-emerald-400/90">{t("plusCommission")}</span>
                </div>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full border-secondary-500/30 text-secondary-400 hover:bg-secondary-500/10">
                    {t("contactUs")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative py-28 sm:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative rounded-[2rem] overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            {/* Background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-zinc-900 to-secondary-600/20" />
            <div className="absolute inset-0">
              <motion.div
                className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-[150px]"
                animate={{ y: [-20, 20, -20], x: [-15, 15, -15] }}
                transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-secondary-500/10 blur-[150px]"
                animate={{ y: [15, -15, 15] }}
                transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
              />
            </div>
            <DotGrid className="absolute inset-0 opacity-30" />

            {/* Border glow */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/[0.06]" />

            {/* Content */}
            <motion.div
              className="relative z-10 py-20 sm:py-28 px-8 sm:px-16 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.h2
                variants={blurUp}
                custom={0}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-[-0.03em] max-w-3xl mx-auto"
              >
                {t("ctaTitle")}
              </motion.h2>
              <motion.p
                variants={blurUp}
                custom={1}
                className="mt-6 text-zinc-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed"
              >
                {t("ctaDesc")}
              </motion.p>
              <motion.div variants={blurUp} custom={2} className="mt-10">
                <Link href="/contact">
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-block"
                  >
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 opacity-40 blur-lg group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg">
                      {t("contactUs")}
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
