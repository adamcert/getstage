"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Music,
  PartyPopper,
  Theater,
  Cake,
  Sparkles,
  Heart,
  Mail,
  User,
  Calendar,
  MessageSquare,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Send,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn, formatPrice } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface GiftCardDesign {
  id: string;
  name: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  pattern: string;
}

interface FormData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  message: string;
  sendDate: "now" | "scheduled";
  scheduledDate: string;
}

interface FormErrors {
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  scheduledDate?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PRESET_AMOUNTS = [25, 50, 75, 100, 150];
const MIN_CUSTOM_AMOUNT = 10;
const MAX_CUSTOM_AMOUNT = 500;
const MAX_MESSAGE_LENGTH = 200;

const GIFT_CARD_DESIGNS: GiftCardDesign[] = [
  {
    id: "concert",
    name: "Concert",
    icon: Music,
    gradient: "from-purple-500 via-pink-500 to-red-500",
    iconColor: "text-white",
    pattern: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)",
  },
  {
    id: "party",
    name: "Soiree",
    icon: PartyPopper,
    gradient: "from-amber-400 via-orange-500 to-pink-500",
    iconColor: "text-white",
    pattern: "radial-gradient(circle at 10% 90%, rgba(255,255,255,0.12) 0%, transparent 40%), radial-gradient(circle at 90% 10%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    id: "theatre",
    name: "Theatre",
    icon: Theater,
    gradient: "from-red-600 via-rose-600 to-pink-600",
    iconColor: "text-white",
    pattern: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0,0,0,0.1) 0%, transparent 40%)",
  },
  {
    id: "birthday",
    name: "Anniversaire",
    icon: Cake,
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    iconColor: "text-white",
    pattern: "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.15) 0%, transparent 45%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    id: "celebration",
    name: "Celebration",
    icon: Sparkles,
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    iconColor: "text-white",
    pattern: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 60%), linear-gradient(45deg, rgba(0,0,0,0.05) 0%, transparent 50%)",
  },
  {
    id: "love",
    name: "Amour",
    icon: Heart,
    gradient: "from-pink-400 via-rose-500 to-red-500",
    iconColor: "text-white",
    pattern: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 45%)",
  },
];

// =============================================================================
// VALIDATION
// =============================================================================

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.recipientEmail.trim()) {
    errors.recipientEmail = "L'email du destinataire est requis";
  } else if (!validateEmail(data.recipientEmail)) {
    errors.recipientEmail = "L'email n'est pas valide";
  }

  if (!data.recipientName.trim()) {
    errors.recipientName = "Le nom du destinataire est requis";
  } else if (data.recipientName.trim().length < 2) {
    errors.recipientName = "Le nom doit contenir au moins 2 caracteres";
  }

  if (!data.senderName.trim()) {
    errors.senderName = "Votre nom est requis";
  } else if (data.senderName.trim().length < 2) {
    errors.senderName = "Votre nom doit contenir au moins 2 caracteres";
  }

  if (data.message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Le message ne peut pas depasser ${MAX_MESSAGE_LENGTH} caracteres`;
  }

  if (data.sendDate === "scheduled") {
    if (!data.scheduledDate) {
      errors.scheduledDate = "Veuillez choisir une date d'envoi";
    } else {
      const selectedDate = new Date(data.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.scheduledDate = "La date doit etre dans le futur";
      }
    }
  }

  return errors;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const cardPreviewVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

// =============================================================================
// GIFT CARD PREVIEW COMPONENT
// =============================================================================

interface GiftCardPreviewProps {
  design: GiftCardDesign;
  amount: number;
  recipientName: string;
  senderName: string;
  message: string;
}

function GiftCardPreview({
  design,
  amount,
  recipientName,
  senderName,
  message,
}: GiftCardPreviewProps) {
  const Icon = design.icon;

  return (
    <motion.div
      key={design.id}
      variants={cardPreviewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl shadow-2xl",
          "aspect-[1.6/1] w-full max-w-md mx-auto",
          "bg-gradient-to-br",
          design.gradient
        )}
        style={{ backgroundImage: design.pattern }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                  Carte Cadeau
                </p>
                <p className="text-white font-bold text-sm">Events</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className={cn("w-6 h-6", design.iconColor)} />
            </div>
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="text-white/60 text-sm mb-1">Valeur</p>
            <p className="text-white text-4xl font-bold tracking-tight">
              {formatPrice(amount)}
            </p>
          </div>

          {/* Footer */}
          <div className="space-y-2">
            {recipientName && (
              <p className="text-white/90 text-sm">
                <span className="text-white/60">Pour:</span> {recipientName}
              </p>
            )}
            {senderName && (
              <p className="text-white/90 text-sm">
                <span className="text-white/60">De:</span> {senderName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Message preview */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Message</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// =============================================================================
// AMOUNT SELECTOR COMPONENT
// =============================================================================

interface AmountSelectorProps {
  selectedAmount: number;
  customAmount: string;
  isCustom: boolean;
  onSelectPreset: (amount: number) => void;
  onCustomChange: (value: string) => void;
  onCustomFocus: () => void;
}

function AmountSelector({
  selectedAmount,
  customAmount,
  isCustom,
  onSelectPreset,
  onCustomChange,
  onCustomFocus,
}: AmountSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Preset amounts */}
      <div className="grid grid-cols-5 gap-3">
        {PRESET_AMOUNTS.map((amount) => (
          <motion.button
            key={amount}
            type="button"
            onClick={() => onSelectPreset(amount)}
            className={cn(
              "relative py-4 px-2 rounded-xl font-bold text-lg transition-all duration-200",
              "border-2",
              selectedAmount === amount && !isCustom
                ? "border-primary-500 bg-primary-50 text-primary-600 shadow-lg shadow-primary-500/20"
                : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {amount}
            <span className="text-sm font-normal">{"\u00A0"}EUR</span>
            {selectedAmount === amount && !isCustom && (
              <motion.div
                layoutId="amountSelector"
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
                initial={false}
              >
                <CheckCircle className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Custom amount */}
      <div
        className={cn(
          "relative rounded-xl border-2 transition-all duration-200",
          isCustom
            ? "border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/20"
            : "border-gray-200 bg-white"
        )}
      >
        <div className="flex items-center p-3 gap-3">
          <span
            className={cn(
              "text-sm font-medium whitespace-nowrap",
              isCustom ? "text-primary-600" : "text-gray-500"
            )}
          >
            Montant personnalise
          </span>
          <div className="flex-1 relative">
            <input
              type="number"
              min={MIN_CUSTOM_AMOUNT}
              max={MAX_CUSTOM_AMOUNT}
              value={customAmount}
              onChange={(e) => onCustomChange(e.target.value)}
              onFocus={onCustomFocus}
              placeholder={`${MIN_CUSTOM_AMOUNT} - ${MAX_CUSTOM_AMOUNT}`}
              className={cn(
                "w-full px-4 py-2 rounded-lg border border-gray-200 outline-none",
                "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
                "transition-all duration-200 text-right font-bold text-lg",
                isCustom ? "bg-white" : "bg-gray-50"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              EUR
            </span>
          </div>
        </div>
        {isCustom && (
          <motion.div
            layoutId="amountSelector"
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
            initial={false}
          >
            <CheckCircle className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>

      {/* Amount range info */}
      <p className="text-xs text-gray-500 text-center">
        Montant personnalise entre {MIN_CUSTOM_AMOUNT} EUR et {MAX_CUSTOM_AMOUNT} EUR
      </p>
    </div>
  );
}

// =============================================================================
// DESIGN SELECTOR COMPONENT
// =============================================================================

interface DesignSelectorProps {
  selectedDesign: GiftCardDesign;
  onSelect: (design: GiftCardDesign) => void;
}

function DesignSelector({ selectedDesign, onSelect }: DesignSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {GIFT_CARD_DESIGNS.map((design) => {
        const Icon = design.icon;
        const isSelected = selectedDesign.id === design.id;

        return (
          <motion.button
            key={design.id}
            type="button"
            onClick={() => onSelect(design)}
            className={cn(
              "relative overflow-hidden rounded-xl aspect-[1.4/1] transition-all duration-200",
              "border-2",
              isSelected
                ? "border-primary-500 ring-2 ring-primary-500/30 shadow-lg"
                : "border-gray-200 hover:border-primary-300"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background gradient */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                design.gradient
              )}
              style={{ backgroundImage: design.pattern }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center gap-2 p-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className={cn("w-5 h-5", design.iconColor)} />
              </div>
              <span className="text-white font-semibold text-sm">
                {design.name}
              </span>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-4 h-4 text-primary-500" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function GiftCardsPage() {
  // Amount state
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);

  // Design state
  const [selectedDesign, setSelectedDesign] = useState(GIFT_CARD_DESIGNS[0]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    recipientEmail: "",
    recipientName: "",
    senderName: "",
    message: "",
    sendDate: "now",
    scheduledDate: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate final amount
  const finalAmount = useMemo(() => {
    if (isCustomAmount && customAmount) {
      const parsed = parseFloat(customAmount);
      if (!isNaN(parsed) && parsed >= MIN_CUSTOM_AMOUNT && parsed <= MAX_CUSTOM_AMOUNT) {
        return parsed;
      }
    }
    return selectedAmount;
  }, [isCustomAmount, customAmount, selectedAmount]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const formErrors = validateForm(formData);
    const hasValidAmount = finalAmount >= MIN_CUSTOM_AMOUNT && finalAmount <= MAX_CUSTOM_AMOUNT;
    return Object.keys(formErrors).length === 0 && hasValidAmount;
  }, [formData, finalAmount]);

  // Handlers
  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustomAmount(false);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setIsCustomAmount(true);
    }
  };

  const handleCustomFocus = () => {
    setIsCustomAmount(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const fieldErrors = validateForm(formData);
    if (fieldErrors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name as keyof FormErrors],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm(formData);
    setErrors(formErrors);
    setTouched({
      recipientEmail: true,
      recipientName: true,
      senderName: true,
      message: true,
      scheduledDate: true,
    });

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const sendInfo =
        formData.sendDate === "now"
          ? "immediatement"
          : `le ${new Date(formData.scheduledDate).toLocaleDateString("fr-FR")}`;

      alert(
        `Carte cadeau achetee avec succes !\n\n` +
          `Montant: ${formatPrice(finalAmount)}\n` +
          `Pour: ${formData.recipientName}\n` +
          `Envoi: ${sendInfo}\n\n` +
          `Un email de confirmation a ete envoye.`
      );

      // Reset form
      setFormData({
        recipientEmail: "",
        recipientName: "",
        senderName: "",
        message: "",
        sendDate: "now",
        scheduledDate: "",
      });
      setTouched({});
    } catch {
      alert("Une erreur est survenue. Veuillez reessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Get minimum date for scheduler (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/30 mb-6">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cartes Cadeaux
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Offrez des experiences inoubliables. Nos cartes cadeaux sont valables
            sur tous les evenements de la plateforme.
          </p>
        </motion.div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Configuration */}
          <motion.div variants={itemVariants} className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Amount Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Choisir le montant</h2>
                    <p className="text-sm text-gray-500">
                      Selectionnez un montant ou personnalisez-le
                    </p>
                  </div>
                </div>

                <AmountSelector
                  selectedAmount={selectedAmount}
                  customAmount={customAmount}
                  isCustom={isCustomAmount}
                  onSelectPreset={handlePresetSelect}
                  onCustomChange={handleCustomChange}
                  onCustomFocus={handleCustomFocus}
                />
              </div>

              {/* Design Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg shadow-secondary-500/25">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Choisir le design</h2>
                    <p className="text-sm text-gray-500">
                      Selectionnez un design pour la carte
                    </p>
                  </div>
                </div>

                <DesignSelector
                  selectedDesign={selectedDesign}
                  onSelect={setSelectedDesign}
                />
              </div>

              {/* Recipient Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/25">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">
                      Informations du destinataire
                    </h2>
                    <p className="text-sm text-gray-500">
                      A qui souhaitez-vous offrir cette carte ?
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Recipient Email */}
                  <Input
                    label="Email du destinataire *"
                    type="email"
                    name="recipientEmail"
                    value={formData.recipientEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.recipientEmail ? errors.recipientEmail : undefined}
                    placeholder="destinataire@email.com"
                    leftIcon={<Mail className="w-5 h-5" />}
                  />

                  {/* Recipient Name */}
                  <Input
                    label="Nom du destinataire *"
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.recipientName ? errors.recipientName : undefined}
                    placeholder="Marie Dupont"
                    leftIcon={<User className="w-5 h-5" />}
                  />

                  {/* Sender Name */}
                  <Input
                    label="Votre nom (expediteur) *"
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.senderName ? errors.senderName : undefined}
                    placeholder="Jean Martin"
                    leftIcon={<User className="w-5 h-5" />}
                  />

                  {/* Message */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message personnalise (optionnel)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-4 text-gray-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Joyeux anniversaire ! Profite bien de cette carte pour assister a tes evenements preferes..."
                        maxLength={MAX_MESSAGE_LENGTH}
                        rows={3}
                        className={cn(
                          "w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white",
                          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none",
                          "transition-all duration-200 placeholder:text-gray-400 resize-none",
                          errors.message &&
                            touched.message &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        )}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      {errors.message && touched.message ? (
                        <p className="text-sm text-red-500">{errors.message}</p>
                      ) : (
                        <span />
                      )}
                      <p
                        className={cn(
                          "text-xs",
                          formData.message.length > MAX_MESSAGE_LENGTH * 0.9
                            ? "text-amber-500"
                            : "text-gray-400"
                        )}
                      >
                        {formData.message.length}/{MAX_MESSAGE_LENGTH}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Send Date Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Date d&apos;envoi</h2>
                    <p className="text-sm text-gray-500">
                      Quand souhaitez-vous envoyer la carte ?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Send Now */}
                  <label
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      formData.sendDate === "now"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="sendDate"
                      value="now"
                      checked={formData.sendDate === "now"}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-500 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Envoyer maintenant
                      </p>
                      <p className="text-sm text-gray-500">
                        Le destinataire recevra la carte immediatement
                      </p>
                    </div>
                    <ArrowRight
                      className={cn(
                        "w-5 h-5",
                        formData.sendDate === "now"
                          ? "text-primary-500"
                          : "text-gray-400"
                      )}
                    />
                  </label>

                  {/* Schedule */}
                  <label
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      formData.sendDate === "scheduled"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="sendDate"
                      value="scheduled"
                      checked={formData.sendDate === "scheduled"}
                      onChange={handleChange}
                      className="w-5 h-5 mt-1 text-primary-500 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Programmer l&apos;envoi
                        </p>
                        <p className="text-sm text-gray-500">
                          Choisissez une date pour l&apos;envoi automatique
                        </p>
                      </div>

                      {formData.sendDate === "scheduled" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <input
                            type="date"
                            name="scheduledDate"
                            value={formData.scheduledDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min={today}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white",
                              "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none",
                              "transition-all duration-200",
                              errors.scheduledDate &&
                                touched.scheduledDate &&
                                "border-red-500"
                            )}
                          />
                          {errors.scheduledDate && touched.scheduledDate && (
                            <p className="mt-2 text-sm text-red-500">
                              {errors.scheduledDate}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button - Mobile */}
              <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(finalAmount)}
                  </span>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!isFormValid || isProcessing}
                  isLoading={isProcessing}
                  leftIcon={!isProcessing ? <Gift className="w-5 h-5" /> : undefined}
                >
                  {isProcessing
                    ? "Traitement en cours..."
                    : `Acheter ${formatPrice(finalAmount)}`}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Right Column - Preview (Sticky) */}
          <motion.div variants={itemVariants} className="lg:sticky lg:top-8 space-y-6 self-start">
            {/* Preview Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Apercu de la carte</h2>
                  <p className="text-sm text-gray-500">
                    Voici ce que recevra le destinataire
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <GiftCardPreview
                  design={selectedDesign}
                  amount={finalAmount}
                  recipientName={formData.recipientName}
                  senderName={formData.senderName}
                  message={formData.message}
                />
              </AnimatePresence>
            </div>

            {/* Summary & Purchase - Desktop */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Summary */}
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-gray-900">Resume</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Montant de la carte</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(finalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Design</span>
                    <span className="font-medium text-gray-900">
                      {selectedDesign.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Envoi</span>
                    <span className="font-medium text-gray-900">
                      {formData.sendDate === "now"
                        ? "Immediat"
                        : formData.scheduledDate
                        ? new Date(formData.scheduledDate).toLocaleDateString(
                            "fr-FR"
                          )
                        : "A programmer"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total & Button */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(finalAmount)}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!isFormValid || isProcessing}
                  isLoading={isProcessing}
                  leftIcon={!isProcessing ? <Gift className="w-5 h-5" /> : undefined}
                  onClick={handleSubmit}
                >
                  {isProcessing
                    ? "Traitement en cours..."
                    : `Acheter ${formatPrice(finalAmount)}`}
                </Button>

                {/* Validation status */}
                {!isFormValid && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-700">
                      Veuillez remplir tous les champs requis
                    </p>
                  </div>
                )}

                {isFormValid && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700 font-medium">
                        Pret a acheter
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    Valable sur tous les evenements
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">
                    Envoi instantane par email
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">
                    Validite de 12 mois
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
