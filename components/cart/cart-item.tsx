"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/ui";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types/database";

// =============================================================================
// TYPES
// =============================================================================

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (ticketTypeId: string, quantity: number) => void;
  onRemove: (ticketTypeId: string) => void;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20, height: 0, marginBottom: 0 },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const subtotal = item.price * item.quantity;

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
      layout
      className="bg-zinc-800 rounded-xl border border-zinc-700 border-l-2 border-l-primary-500/50 p-4"
    >
      {/* Event Title */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-zinc-100 truncate">
            {item.eventTitle}
          </h4>
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(item.eventDate)}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.ticketTypeId)}
          className="text-zinc-500 hover:text-primary-400 hover:bg-primary-500/10 -mr-2 -mt-1"
          aria-label="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Ticket Type */}
      <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-zinc-900 rounded-lg">
        <Ticket className="w-4 h-4 text-primary-400" />
        <span className="text-sm font-medium text-zinc-300">{item.name}</span>
        <span className="text-sm text-zinc-500 ml-auto">
          {formatPrice(item.price)}
        </span>
      </div>

      {/* Quantity & Subtotal */}
      <div className="flex items-center justify-between">
        {/* Quantity Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 mr-1">Quantité :</span>
          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.ticketTypeId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                item.quantity <= 1
                  ? "text-zinc-600 cursor-not-allowed"
                  : "text-zinc-300 hover:bg-zinc-700"
              )}
              aria-label="Diminuer la quantité"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-semibold text-zinc-100">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.ticketTypeId, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-300 hover:bg-zinc-700 transition-colors"
              aria-label="Augmenter la quantité"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <span className="text-sm text-zinc-500">Sous-total</span>
          <p className="font-bold text-zinc-100">{formatPrice(subtotal)}</p>
        </div>
      </div>
    </motion.div>
  );
}
