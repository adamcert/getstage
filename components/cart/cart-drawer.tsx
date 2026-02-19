"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { CartItem } from "./cart-item";
import { useCartStore, selectCartItemCount } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center px-6"
    >
      <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
        <ShoppingBag className="w-10 h-10 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">
        Votre panier est vide
      </h3>
      <p className="text-zinc-500 mb-6 max-w-xs">
        Explorez nos événements et ajoutez des billets à votre panier pour
        continuer.
      </p>
      <Button variant="primary" onClick={onClose}>
        Découvrir les événements
      </Button>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const itemCount = useCartStore(selectCartItemCount);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  // Handle checkout navigation
  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  // Group items by event
  const itemsByEvent = items.reduce(
    (acc, item) => {
      if (!acc[item.eventId]) {
        acc[item.eventId] = {
          eventTitle: item.eventTitle,
          eventDate: item.eventDate,
          items: [],
          subtotal: 0,
        };
      }
      acc[item.eventId].items.push(item);
      acc[item.eventId].subtotal += item.price * item.quantity;
      return acc;
    },
    {} as Record<
      string,
      {
        eventTitle: string;
        eventDate: string;
        items: typeof items;
        subtotal: number;
      }
    >
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2
                    id="cart-drawer-title"
                    className="text-lg font-bold text-zinc-100"
                  >
                    Mon panier
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {itemCount} {itemCount > 1 ? "articles" : "article"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-300"
                aria-label="Fermer le panier"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <EmptyCart onClose={onClose} />
              ) : (
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-4 space-y-4"
                >
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItem
                        key={item.ticketTypeId}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Clear Cart Button */}
                  {items.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-2"
                    >
                      <button
                        type="button"
                        onClick={clearCart}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-primary-400 transition-colors mx-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Vider le panier
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-t border-zinc-800 p-6 space-y-4 bg-zinc-800/50"
              >
                {/* Summary by event */}
                <div className="space-y-2">
                  {Object.entries(itemsByEvent).map(([eventId, group]) => (
                    <div
                      key={eventId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-zinc-400 truncate max-w-[200px]">
                        {group.eventTitle}
                      </span>
                      <span className="font-medium text-zinc-100">
                        {formatPrice(group.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-700" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-zinc-300">
                    Total
                  </span>
                  <span className="text-xl font-bold text-primary-400">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Passer la commande
                </Button>

                {/* Continue Shopping Link */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center text-sm text-zinc-500 hover:text-primary-400 transition-colors"
                >
                  Continuer mes achats
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
