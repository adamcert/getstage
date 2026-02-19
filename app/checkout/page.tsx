"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Mail,
  User,
  Phone,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Ticket,
  Calendar,
  Shield,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useCartStore, selectCartItemCount } from "@/stores/cart-store";
import { cn, formatPrice, formatDate } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface FormData {
  email: string;
  fullName: string;
  phone: string;
  acceptTerms: boolean;
}

interface FormErrors {
  email?: string;
  fullName?: string;
  phone?: string;
  acceptTerms?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SERVICE_FEE_PER_TICKET = 2; // 2 euros par billet

// =============================================================================
// VALIDATION
// =============================================================================

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.email.trim()) {
    errors.email = "L'email est requis";
  } else if (!validateEmail(data.email)) {
    errors.email = "L'email n'est pas valide";
  }

  if (!data.fullName.trim()) {
    errors.fullName = "Le nom complet est requis";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Le nom doit contenir au moins 2 caractères";
  }

  if (data.phone && !/^[+\d\s()-]{6,}$/.test(data.phone)) {
    errors.phone = "Le numéro de téléphone n'est pas valide";
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions générales";
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

// =============================================================================
// ORDER SUMMARY COMPONENT
// =============================================================================

interface OrderSummaryProps {
  items: ReturnType<typeof useCartStore.getState>["items"];
  subtotal: number;
  serviceFees: number;
  total: number;
  totalTickets: number;
}

function OrderSummary({
  items,
  subtotal,
  serviceFees,
  total,
  totalTickets,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Résumé de commande</h2>
            <p className="text-sm text-gray-500">
              {totalTickets} {totalTickets > 1 ? "billets" : "billet"}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.ticketTypeId}
            className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-5 h-5 text-secondary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {item.eventTitle}
              </h4>
              <p className="text-sm text-gray-500">{item.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(item.eventDate)}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm text-gray-500">x{item.quantity}</span>
              <p className="font-semibold text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="bg-gray-50 px-6 py-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Sous-total</span>
          <span className="font-medium text-gray-900">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Frais de service ({formatPrice(SERVICE_FEE_PER_TICKET)} x{" "}
            {totalTickets})
          </span>
          <span className="font-medium text-gray-900">
            {formatPrice(serviceFees)}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Paiement sécurisé - Vos données sont protégées</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.total);
  const itemCount = useCartStore(selectCartItemCount);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    fullName: "",
    phone: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Calculate totals
  const serviceFees = useMemo(
    () => itemCount * SERVICE_FEE_PER_TICKET,
    [itemCount]
  );
  const total = useMemo(() => subtotal + serviceFees, [subtotal, serviceFees]);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (isClient && items.length === 0) {
      router.push("/search");
    }
  }, [isClient, items.length, router]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle blur (mark field as touched)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate single field on blur
    const fieldErrors = validateForm(formData);
    if (fieldErrors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name as keyof FormErrors],
      }));
    }
  };

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const formErrors = validateForm(formData);
    return Object.keys(formErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    // Mark all fields as touched
    setTouched({
      email: true,
      fullName: true,
      phone: true,
      acceptTerms: true,
    });

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    // Simulate payment processing
    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      alert(
        `Paiement réussi ! \n\nMerci ${formData.fullName} pour votre commande de ${formatPrice(total)}.\n\nUn email de confirmation a été envoyé à ${formData.email}.`
      );

      // Clear cart and redirect
      clearCart();
      router.push("/");
    } catch {
      alert("Une erreur est survenue lors du paiement. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Redirect will happen in useEffect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
        </motion.div>

        {/* Page Title */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finaliser ma commande</h1>
          <p className="text-gray-500 mt-2">
            Complétez vos informations pour recevoir vos billets
          </p>
        </motion.div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Form */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">
                      Informations personnelles
                    </h2>
                    <p className="text-sm text-gray-500">
                      Ces informations seront utilisées pour vos billets
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Email */}
                  <Input
                    label="Email *"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email ? errors.email : undefined}
                    placeholder="votre@email.com"
                    leftIcon={<Mail className="w-5 h-5" />}
                  />

                  {/* Full Name */}
                  <Input
                    label="Nom complet *"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fullName ? errors.fullName : undefined}
                    placeholder="Jean Dupont"
                    leftIcon={<User className="w-5 h-5" />}
                  />

                  {/* Phone */}
                  <Input
                    label="Téléphone (optionnel)"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone ? errors.phone : undefined}
                    placeholder="+33 6 12 34 56 78"
                    leftIcon={<Phone className="w-5 h-5" />}
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className={cn(
                      "mt-1 w-5 h-5 rounded border-gray-300 text-primary-500",
                      "focus:ring-primary-500 focus:ring-offset-0 cursor-pointer",
                      touched.acceptTerms &&
                        errors.acceptTerms &&
                        "border-red-500"
                    )}
                  />
                  <div className="flex-1">
                    <span className="text-gray-700">
                      J&apos;accepte les{" "}
                      <a
                        href="/terms"
                        className="text-primary-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        conditions générales de vente
                      </a>{" "}
                      et la{" "}
                      <a
                        href="/privacy"
                        className="text-primary-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        politique de confidentialité
                      </a>{" "}
                      *
                    </span>
                    {touched.acceptTerms && errors.acceptTerms && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.acceptTerms}
                      </p>
                    )}
                  </div>
                </label>
              </div>

              {/* Payment Button */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!isFormValid || isProcessing}
                  isLoading={isProcessing}
                  leftIcon={
                    !isProcessing ? <CreditCard className="w-5 h-5" /> : undefined
                  }
                >
                  {isProcessing ? "Traitement en cours..." : `Payer ${formatPrice(total)}`}
                </Button>

                {/* Form validation summary */}
                {!isFormValid && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700">
                        <p className="font-medium">
                          Veuillez compléter le formulaire
                        </p>
                        <ul className="mt-1 list-disc list-inside">
                          {!formData.email && <li>Email requis</li>}
                          {formData.email &&
                            !validateEmail(formData.email) && (
                              <li>Email invalide</li>
                            )}
                          {!formData.fullName && <li>Nom complet requis</li>}
                          {!formData.acceptTerms && (
                            <li>Acceptation des CGU requise</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success state indicator */}
                {isFormValid && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-700 font-medium">
                        Formulaire complet - Prêt à payer
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </motion.div>

          {/* Right Column - Order Summary (Sticky) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="lg:sticky lg:top-8">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                serviceFees={serviceFees}
                total={total}
                totalTickets={itemCount}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
