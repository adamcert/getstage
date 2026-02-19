"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Gift,
  Music,
  PartyPopper,
  Theater,
  Sparkles,
  Heart,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Check,
  ArrowRight,
  Star,
  Zap,
  Crown,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface GiftCardDesign {
  id: string;
  name: string;
  icon: React.ElementType;
  gradient: string;
  accent: string;
  pattern: "geometric" | "waves" | "dots" | "lines" | "stars" | "hearts";
}

interface FormData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  message: string;
  sendDate: "now" | "scheduled";
  scheduledDate: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PRESET_AMOUNTS = [25, 50, 100, 200, 500];
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 1000;
const MAX_MESSAGE_LENGTH = 150;

const DESIGNS: GiftCardDesign[] = [
  {
    id: "midnight",
    name: "Midnight Gold",
    icon: Crown,
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    accent: "#D4AF37",
    pattern: "geometric",
  },
  {
    id: "concert",
    name: "Electric Night",
    icon: Music,
    gradient: "from-violet-900 via-purple-800 to-fuchsia-900",
    accent: "#E879F9",
    pattern: "waves",
  },
  {
    id: "celebration",
    name: "Champagne",
    icon: Sparkles,
    gradient: "from-amber-100 via-yellow-50 to-amber-100",
    accent: "#B45309",
    pattern: "dots",
  },
  {
    id: "party",
    name: "Neon Dreams",
    icon: PartyPopper,
    gradient: "from-cyan-500 via-blue-600 to-violet-700",
    accent: "#22D3EE",
    pattern: "lines",
  },
  {
    id: "theatre",
    name: "Velvet Rouge",
    icon: Theater,
    gradient: "from-rose-900 via-red-800 to-rose-900",
    accent: "#FCA5A5",
    pattern: "stars",
  },
  {
    id: "love",
    name: "Rose Petal",
    icon: Heart,
    gradient: "from-pink-200 via-rose-100 to-pink-200",
    accent: "#BE185D",
    pattern: "hearts",
  },
];

// =============================================================================
// PATTERN COMPONENTS
// =============================================================================

function CardPattern({ pattern, accent }: { pattern: string; accent: string }) {
  const patternElements = {
    geometric: (
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 250">
        <defs>
          <pattern id="geo" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M25 0L50 25L25 50L0 25Z" fill="none" stroke={accent} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geo)" />
      </svg>
    ),
    waves: (
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 250">
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M-50 ${50 + i * 50} Q50 ${25 + i * 50} 150 ${50 + i * 50} T350 ${50 + i * 50} T550 ${50 + i * 50}`}
            fill="none"
            stroke={accent}
            strokeWidth="1"
            opacity={0.3 + i * 0.1}
          />
        ))}
      </svg>
    ),
    dots: (
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 250">
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill={accent} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    ),
    lines: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 400 250">
        {[...Array(20)].map((_, i) => (
          <line
            key={i}
            x1={i * 25 - 50}
            y1="0"
            x2={i * 25 + 200}
            y2="250"
            stroke={accent}
            strokeWidth="1"
          />
        ))}
      </svg>
    ),
    stars: (
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 250">
        {[...Array(12)].map((_, i) => (
          <text
            key={i}
            x={30 + (i % 4) * 100 + (Math.floor(i / 4) % 2) * 50}
            y={40 + Math.floor(i / 4) * 70}
            fill={accent}
            fontSize="16"
            opacity={0.3 + Math.random() * 0.4}
          >
            &#10022;
          </text>
        ))}
      </svg>
    ),
    hearts: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 400 250">
        {[...Array(8)].map((_, i) => (
          <text
            key={i}
            x={40 + (i % 4) * 90 + (Math.floor(i / 4) % 2) * 45}
            y={60 + Math.floor(i / 4) * 100}
            fill={accent}
            fontSize="24"
            opacity={0.2 + Math.random() * 0.3}
          >
            &#9829;
          </text>
        ))}
      </svg>
    ),
  };

  return patternElements[pattern as keyof typeof patternElements] || null;
}

// =============================================================================
// 3D GIFT CARD COMPONENT
// =============================================================================

function GiftCard3D({
  design,
  amount,
  recipientName,
  senderName,
}: {
  design: GiftCardDesign;
  amount: number;
  recipientName: string;
  senderName: string;
}) {
  const Icon = design.icon;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const isLightDesign = design.id === "celebration" || design.id === "love";

  return (
    <div className="perspective-1000" style={{ perspective: "1000px" }}>
      <motion.div
        className="relative w-full max-w-[420px] mx-auto"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Card Shadow */}
        <div className="absolute inset-4 bg-black/20 blur-2xl rounded-3xl transform translate-y-4" />

        {/* Main Card */}
        <motion.div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "aspect-[1.586/1] w-full",
            "bg-gradient-to-br shadow-2xl",
            design.gradient
          )}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Pattern Overlay */}
          <CardPattern pattern={design.pattern} accent={design.accent} />

          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(105deg, transparent 40%, ${design.accent}40 45%, ${design.accent}20 50%, transparent 55%)`,
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["200% 0%", "-200% 0%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
          />

          {/* Content */}
          <div className="relative h-full p-6 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${design.accent}30, ${design.accent}10)`,
                    border: `1px solid ${design.accent}40`,
                  }}
                >
                  <Gift
                    className="w-6 h-6"
                    style={{ color: isLightDesign ? design.accent : design.accent }}
                  />
                </div>
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: isLightDesign ? design.accent : `${design.accent}CC` }}
                  >
                    Carte Cadeau
                  </p>
                  <p
                    className={cn(
                      "text-lg font-bold tracking-tight",
                      isLightDesign ? "text-slate-800" : "text-white"
                    )}
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Events
                  </p>
                </div>
              </div>

              <motion.div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${design.accent}25, transparent)`,
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon
                  className="w-7 h-7"
                  style={{ color: isLightDesign ? design.accent : design.accent }}
                />
              </motion.div>
            </div>

            {/* Amount - Center */}
            <div className="text-center py-4">
              <motion.div
                key={amount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <p
                  className={cn(
                    "text-5xl md:text-6xl font-bold tracking-tighter",
                    isLightDesign ? "text-slate-800" : "text-white"
                  )}
                  style={{
                    fontFamily: "Georgia, serif",
                    textShadow: isLightDesign ? "none" : "0 2px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {amount}
                  <span className="text-2xl md:text-3xl ml-1">&#8364;</span>
                </p>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                {recipientName && (
                  <p
                    className={cn(
                      "text-sm",
                      isLightDesign ? "text-slate-600" : "text-white/80"
                    )}
                  >
                    Pour{" "}
                    <span className={cn("font-semibold", isLightDesign ? "text-slate-800" : "text-white")}>
                      {recipientName}
                    </span>
                  </p>
                )}
                {senderName && (
                  <p
                    className={cn(
                      "text-xs",
                      isLightDesign ? "text-slate-500" : "text-white/60"
                    )}
                  >
                    De la part de {senderName}
                  </p>
                )}
              </div>

              {/* Chip visual */}
              <div
                className="w-10 h-8 rounded"
                style={{
                  background: `linear-gradient(135deg, ${design.accent}60, ${design.accent}30)`,
                }}
              />
            </div>
          </div>

          {/* Edge highlight */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              border: `1px solid ${design.accent}30`,
              boxShadow: `inset 0 1px 0 ${design.accent}20`,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// AMOUNT BUTTON
// =============================================================================

function AmountButton({
  amount,
  selected,
  onClick,
}: {
  amount: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "relative py-5 px-4 rounded-xl font-bold text-xl transition-all",
        "border-2 overflow-hidden group",
        selected
          ? "border-secondary-500 bg-secondary-500/10 text-secondary-300"
          : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
      )}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {selected && (
        <motion.div
          layoutId="amountGlow"
          className="absolute inset-0 bg-gradient-to-br from-secondary-500/20 to-primary-500/20"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative">{amount}&#8364;</span>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  );
}

// =============================================================================
// DESIGN CARD
// =============================================================================

function DesignCard({
  design,
  selected,
  onClick,
}: {
  design: GiftCardDesign;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = design.icon;
  const isLight = design.id === "celebration" || design.id === "love";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl aspect-[1.3/1] transition-all",
        "border-2",
        selected
          ? "border-secondary-500 ring-4 ring-secondary-500/20"
          : "border-zinc-700 hover:border-zinc-600"
      )}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", design.gradient)} />
      <CardPattern pattern={design.pattern} accent={design.accent} />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center gap-2 p-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: `${design.accent}25` }}
        >
          <Icon className="w-5 h-5" style={{ color: design.accent }} />
        </div>
        <span
          className={cn(
            "font-semibold text-xs",
            isLight ? "text-slate-700" : "text-white"
          )}
        >
          {design.name}
        </span>
      </div>

      {/* Selection */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  );
}

// =============================================================================
// STEP INDICATOR
// =============================================================================

function StepIndicator({
  step,
  currentStep,
  label,
  icon: Icon,
}: {
  step: number;
  currentStep: number;
  label: string;
  icon: React.ElementType;
}) {
  const isActive = currentStep >= step;
  const isCurrent = currentStep === step;

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
          isActive
            ? "bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30"
            : "bg-zinc-800 text-zinc-600"
        )}
        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 2 }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
      <div>
        <p className={cn("text-sm font-medium", isActive ? "text-zinc-100" : "text-zinc-600")}>
          &#201;tape {step}
        </p>
        <p className={cn("text-xs", isActive ? "text-zinc-500" : "text-zinc-600")}>{label}</p>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function GiftCardsPage() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [design, setDesign] = useState(DESIGNS[0]);
  const [formData, setFormData] = useState<FormData>({
    recipientEmail: "",
    recipientName: "",
    senderName: "",
    message: "",
    sendDate: "now",
    scheduledDate: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const finalAmount = useMemo(() => {
    if (isCustom && customAmount) {
      const parsed = parseFloat(customAmount);
      if (!isNaN(parsed) && parsed >= MIN_AMOUNT && parsed <= MAX_AMOUNT) {
        return parsed;
      }
    }
    return amount;
  }, [isCustom, customAmount, amount]);

  const isFormValid = useMemo(() => {
    return (
      formData.recipientEmail.includes("@") &&
      formData.recipientName.length >= 2 &&
      formData.senderName.length >= 2 &&
      finalAmount >= MIN_AMOUNT
    );
  }, [formData, finalAmount]);

  const handlePreset = (value: number) => {
    setAmount(value);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    alert(`Carte cadeau de ${formatPrice(finalAmount)} créée avec succès !`);
    setIsProcessing(false);
  };

  // Auto-advance step based on completion
  useEffect(() => {
    if (finalAmount > 0 && step === 1) return;
    if (design && step === 2) return;
  }, [finalAmount, design, step]);

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8"
            >
              <Star className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300 font-medium">
                Le cadeau parfait pour les amateurs de sorties
              </span>
            </motion.div>

            <h1
              className="text-5xl md:text-7xl font-bold font-display mb-6"
            >
              <span className="text-white">Offrez des</span>
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent">
                moments inoubliables
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
              Nos cartes cadeaux ouvrent les portes de milliers d&apos;événements.
              <br className="hidden md:block" />
              Concerts, théâtre, festivals &mdash; le choix leur appartient.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-12 md:gap-20">
              {[
                { value: "10K+", label: "Événements" },
                { value: "12", label: "Mois de validité" },
                { value: "100%", label: "Sécurisé" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold text-primary-400">{stat.value}</p>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path
              d="M0 60V30C240 10 480 0 720 10C960 20 1200 50 1440 30V60H0Z"
              className="fill-[#09090B]"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left: Configuration */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step Progress */}
            <div className="hidden md:flex items-center justify-between mb-12">
              <StepIndicator step={1} currentStep={step} label="Montant" icon={Zap} />
              <div className="flex-1 h-0.5 bg-zinc-800 mx-4" />
              <StepIndicator step={2} currentStep={step} label="Design" icon={Sparkles} />
              <div className="flex-1 h-0.5 bg-zinc-800 mx-4" />
              <StepIndicator step={3} currentStep={step} label="Destinataire" icon={Gift} />
            </div>

            {/* Step 1: Amount */}
            <motion.div
              className="bg-zinc-900 rounded-3xl shadow-xl shadow-black/20 p-8 border border-zinc-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Choisissez le montant</h2>
                  <p className="text-zinc-500">Sélectionnez ou personnalisez</p>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                {PRESET_AMOUNTS.map((value) => (
                  <AmountButton
                    key={value}
                    amount={value}
                    selected={amount === value && !isCustom}
                    onClick={() => handlePreset(value)}
                  />
                ))}
              </div>

              {/* Custom Amount */}
              <div
                className={cn(
                  "relative rounded-xl border-2 transition-all p-4",
                  isCustom ? "border-secondary-500 bg-secondary-500/10" : "border-zinc-700 bg-zinc-800"
                )}
              >
                <label className="flex items-center gap-4">
                  <span className="text-sm font-medium text-zinc-400">Montant libre</span>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min={MIN_AMOUNT}
                      max={MAX_AMOUNT}
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setIsCustom(true);
                      }}
                      onFocus={() => setIsCustom(true)}
                      placeholder={`${MIN_AMOUNT} - ${MAX_AMOUNT}`}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800 outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 text-right text-xl font-bold text-zinc-100 placeholder-zinc-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                      &#8364;
                    </span>
                  </div>
                </label>
                {isCustom && customAmount && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-6 w-full py-4 rounded-xl bg-zinc-100 text-zinc-900 font-semibold flex items-center justify-center gap-2 hover:bg-white transition-colors"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Step 2: Design */}
            <motion.div
              className={cn(
                "bg-zinc-900 rounded-3xl shadow-xl shadow-black/20 p-8 border border-zinc-800 transition-opacity",
                step >= 2 ? "opacity-100" : "opacity-50 pointer-events-none"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Choisissez le design</h2>
                  <p className="text-zinc-500">6 styles exclusifs</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {DESIGNS.map((d) => (
                  <DesignCard
                    key={d.id}
                    design={d}
                    selected={design.id === d.id}
                    onClick={() => {
                      setDesign(d);
                      setStep(3);
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Step 3: Recipient */}
            <motion.div
              className={cn(
                "bg-zinc-900 rounded-3xl shadow-xl shadow-black/20 p-8 border border-zinc-800 transition-opacity",
                step >= 3 ? "opacity-100" : "opacity-50 pointer-events-none"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Informations du destinataire</h2>
                  <p className="text-zinc-500">À qui offrez-vous cette carte ?</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email du destinataire *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="email"
                        value={formData.recipientEmail}
                        onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                        placeholder="email@exemple.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 text-zinc-100 placeholder-zinc-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Nom du destinataire *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        placeholder="Marie"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 text-zinc-100 placeholder-zinc-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Votre nom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      placeholder="Jean"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 text-zinc-100 placeholder-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Message personnel{" "}
                    <span className="text-zinc-600 font-normal">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      maxLength={MAX_MESSAGE_LENGTH}
                      rows={3}
                      placeholder="Joyeux anniversaire ! Profite bien..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 resize-none text-zinc-100 placeholder-zinc-500"
                    />
                    <span className="absolute right-4 bottom-3 text-xs text-zinc-500">
                      {formData.message.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                </div>

                {/* Send Date */}
                <div className="flex gap-4">
                  <label
                    className={cn(
                      "flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      formData.sendDate === "now"
                        ? "border-secondary-500 bg-secondary-500/10"
                        : "border-zinc-700 hover:border-zinc-600"
                    )}
                  >
                    <input
                      type="radio"
                      checked={formData.sendDate === "now"}
                      onChange={() => setFormData({ ...formData, sendDate: "now" })}
                      className="w-4 h-4 text-secondary-500"
                    />
                    <div>
                      <p className="font-medium text-zinc-100">Maintenant</p>
                      <p className="text-xs text-zinc-500">Envoi immédiat</p>
                    </div>
                  </label>

                  <label
                    className={cn(
                      "flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      formData.sendDate === "scheduled"
                        ? "border-secondary-500 bg-secondary-500/10"
                        : "border-zinc-700 hover:border-zinc-600"
                    )}
                  >
                    <input
                      type="radio"
                      checked={formData.sendDate === "scheduled"}
                      onChange={() => setFormData({ ...formData, sendDate: "scheduled" })}
                      className="w-4 h-4 text-secondary-500"
                    />
                    <div>
                      <p className="font-medium text-zinc-100">Programmer</p>
                      <p className="text-xs text-zinc-500">Choisir une date</p>
                    </div>
                  </label>
                </div>

                {formData.sendDate === "scheduled" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 text-zinc-100"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Preview & Summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Card Preview */}
              <div className="bg-zinc-900 rounded-3xl shadow-xl shadow-black/20 p-8 border border-zinc-800">
                <p className="text-sm font-medium text-zinc-500 mb-6 text-center">
                  Aperçu de votre carte
                </p>
                <AnimatePresence mode="wait">
                  <GiftCard3D
                    key={design.id}
                    design={design}
                    amount={finalAmount}
                    recipientName={formData.recipientName || "Destinataire"}
                    senderName={formData.senderName}
                  />
                </AnimatePresence>

                {formData.message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-zinc-800 rounded-xl border border-zinc-700"
                  >
                    <p className="text-xs text-zinc-500 mb-1">Message</p>
                    <p className="text-sm text-zinc-300 italic">&ldquo;{formData.message}&rdquo;</p>
                  </motion.div>
                )}
              </div>

              {/* Purchase Summary */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-8 text-white">
                <h3 className="font-bold text-lg mb-6">Récapitulatif</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Montant</span>
                    <span className="font-semibold">{formatPrice(finalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Design</span>
                    <span className="font-semibold">{design.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Envoi</span>
                    <span className="font-semibold">
                      {formData.sendDate === "now" ? "Immédiat" : formData.scheduledDate || "À définir"}
                    </span>
                  </div>
                  <div className="h-px bg-zinc-700" />
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Total</span>
                    <span className="text-3xl font-bold text-primary-400">
                      {formatPrice(finalAmount)}
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid || isProcessing}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                    isFormValid
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/30"
                      : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  )}
                  whileHover={isFormValid ? { scale: 1.02 } : {}}
                  whileTap={isFormValid ? { scale: 0.98 } : {}}
                >
                  {isProcessing ? (
                    <motion.div
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Acheter la carte
                    </>
                  )}
                </motion.button>

                {/* Trust */}
                <div className="mt-6 flex items-center justify-center gap-2 text-zinc-500 text-xs">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Paiement sécurisé &bull; Envoi instantané
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
