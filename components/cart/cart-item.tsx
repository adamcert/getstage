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
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
    >
      {/* Event Title */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {item.eventTitle}
          </h4>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(item.eventDate)}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.ticketTypeId)}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 -mr-2 -mt-1"
          aria-label="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Ticket Type */}
      <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 rounded-lg">
        <Ticket className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-gray-700">{item.name}</span>
        <span className="text-sm text-gray-500 ml-auto">
          {formatPrice(item.price)}
        </span>
      </div>

      {/* Quantity & Subtotal */}
      <div className="flex items-center justify-between">
        {/* Quantity Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-1">Quantite :</span>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.ticketTypeId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                item.quantity <= 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-white hover:shadow-sm"
              )}
              aria-label="Diminuer la quantite"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-semibold text-gray-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.ticketTypeId, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm transition-colors"
              aria-label="Augmenter la quantite"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <span className="text-sm text-gray-500">Sous-total</span>
          <p className="font-bold text-gray-900">{formatPrice(subtotal)}</p>
        </div>
      </div>
    </motion.div>
  );
}
