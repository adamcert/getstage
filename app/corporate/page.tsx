"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Store,
  Presentation,
  Users,
  PartyPopper,
  Rocket,
  Building2,
  Layers,
  ClipboardList,
  BarChart3,
  Palette,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const services = [
  { key: "tradeShows" as const, descKey: "tradeShowsDesc" as const, icon: Store, color: "from-teal-500 to-teal-600" },
  { key: "conferences" as const, descKey: "conferencesDesc" as const, icon: Presentation, color: "from-sky-500 to-sky-600" },
  { key: "teamBuilding" as const, descKey: "teamBuildingDesc" as const, icon: Users, color: "from-violet-500 to-violet-600" },
  { key: "galas" as const, descKey: "galasDesc" as const, icon: PartyPopper, color: "from-amber-500 to-amber-600" },
  { key: "productLaunch" as const, descKey: "productLaunchDesc" as const, icon: Rocket, color: "from-rose-500 to-rose-600" },
  { key: "conventions" as const, descKey: "conventionsDesc" as const, icon: Building2, color: "from-indigo-500 to-indigo-600" },
];

const advantages = [
  { key: "turnkey" as const, descKey: "turnkeyDesc" as const, icon: Layers },
  { key: "registration" as const, descKey: "registrationDesc" as const, icon: ClipboardList },
  { key: "analyticsRealtime" as const, descKey: "analyticsRealtimeDesc" as const, icon: BarChart3 },
  { key: "whiteLabel" as const, descKey: "whiteLabelDesc" as const, icon: Palette },
];

export default function CorporatePage() {
  const { t } = useTranslation("corporate");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-500/10 border border-secondary-500/20 text-secondary-400 text-sm font-medium mb-6"
            >
              <Building2 className="w-4 h-4" />
              {t("heroSubtitle")}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6"
            >
              {t("title")}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
            >
              {t("heroDesc")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/contact">
                <Button variant="primary" size="lg" className="px-8">
                  {t("contactUs")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#services">
                <Button variant="outline" size="lg" className="px-8">
                  {t("ourSolutions")}
                </Button>
              </a>
            </motion.div>

            {/* Trust badge */}
            <motion.p
              variants={fadeUp}
              custom={4}
              className="mt-10 text-sm text-zinc-500"
            >
              {t("clientCount")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-display font-bold mb-4"
            >
              {t("servicesTitle")}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-zinc-400 text-lg max-w-2xl mx-auto"
            >
              {t("servicesSubtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.key}
                  variants={fadeUp}
                  custom={i}
                  className="group relative rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(service.key)}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{t(service.descKey)}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20 sm:py-28 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-display font-bold mb-4"
            >
              {t("whyTitle")}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-zinc-400 text-lg max-w-2xl mx-auto"
            >
              {t("whySubtitle")}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {advantages.map((adv, i) => {
              const Icon = adv.icon;
              return (
                <motion.div
                  key={adv.key}
                  variants={fadeUp}
                  custom={i}
                  className="flex gap-5 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t(adv.key)}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{t(adv.descKey)}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative rounded-3xl bg-gradient-to-br from-primary-500/10 via-zinc-900 to-secondary-500/10 border border-zinc-800 p-10 sm:p-16 text-center overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/5 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <motion.h2
                variants={fadeUp}
                custom={0}
                className="text-3xl sm:text-4xl font-display font-bold mb-4"
              >
                {t("ctaTitle")}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="text-zinc-400 text-lg max-w-xl mx-auto mb-8"
              >
                {t("ctaDesc")}
              </motion.p>
              <motion.div variants={fadeUp} custom={2}>
                <Link href="/contact">
                  <Button variant="primary" size="lg" className="px-10">
                    {t("getQuote")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
