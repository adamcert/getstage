"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, AlertCircle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { TicketType } from "@/types/database";

// =============================================================================
// TYPES
// =============================================================================

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  eventId: string;
  eventTitle: string;
  eventDate: string;
}

interface TicketQuantities {
  [ticketTypeId: string]: number;
}

// =============================================================================
// TICKET ROW COMPONENT
// =============================================================================

interface TicketRowProps {
  ticket: TicketType;
  quantity: number;
  onQuantityChange: (ticketId: string, quantity: number) => void;
}

function TicketRow({ ticket, quantity, onQuantityChange }: TicketRowProps) {
  const { t: tt } = useTranslation("tickets");
  const { t: tc } = useTranslation("common");
  const { t: tb } = useTranslation("badges");
  const available = ticket.quantity_total - ticket.quantity_sold;
  const isSoldOut = available <= 0;
  const isLowStock = available > 0 && available <= 10;

  const handleDecrement = useCallback(() => {
    if (quantity > 0) {
      onQuantityChange(ticket.id, quantity - 1);
    }
  }, [ticket.id, quantity, onQuantityChange]);

  const handleIncrement = useCallback(() => {
    const maxAllowed = Math.min(available, ticket.max_per_order);
    if (quantity < maxAllowed) {
      onQuantityChange(ticket.id, quantity + 1);
    }
  }, [ticket.id, quantity, available, ticket.max_per_order, onQuantityChange]);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200",
        isSoldOut
          ? "bg-zinc-800/30 border-zinc-800 opacity-60"
          : quantity > 0
          ? "bg-secondary-500/10 border-secondary-500/30"
          : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
      )}
    >
      {/* Ticket Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-zinc-100">{ticket.name}</h4>
          {isSoldOut && <Badge variant="soldout">{tb("soldOut")}</Badge>}
          {isLowStock && !isSoldOut && (
            <Badge variant="hot">{tt("onlyLeft")} {available}!</Badge>
          )}
        </div>
        {ticket.description && (
          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
            {ticket.description}
          </p>
        )}
        <p className="text-lg font-bold text-zinc-100 mt-2">
          {ticket.price === 0 ? tc("free") : formatPrice(ticket.price)}
        </p>
        {!isSoldOut && (
          <p className="text-xs text-zinc-600 mt-1">
            {available} {available > 1 ? tt("places") : tt("place")} {available > 1 ? tt("remainingPlural") : tt("remaining")}
          </p>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        {!isSoldOut ? (
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDecrement}
              disabled={quantity === 0}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                quantity === 0
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600 active:bg-zinc-500"
              )}
              aria-label={tt("decreaseQty")}
            >
              <Minus className="w-4 h-4" />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.span
                key={quantity}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-10 text-center font-bold text-lg text-zinc-100"
              >
                {quantity}
              </motion.span>
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleIncrement}
              disabled={quantity >= Math.min(available, ticket.max_per_order)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                quantity >= Math.min(available, ticket.max_per_order)
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700"
              )}
              aria-label={tt("increaseQty")}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          <span className="text-sm text-zinc-400 italic">{tt("unavailable")}</span>
        )}

        {/* Line Total */}
        <AnimatePresence>
          {quantity > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -10, width: 0 }}
              className="text-right min-w-[80px]"
            >
              <p className="text-sm text-zinc-500">{tc("subtotal")}</p>
              <p className="font-bold text-secondary-400">
                {formatPrice(ticket.price * quantity)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TicketSelector({
  ticketTypes,
  eventId,
  eventTitle,
  eventDate,
}: TicketSelectorProps) {
  const { t: tt } = useTranslation("tickets");
  const { t: tc } = useTranslation("common");
  const [quantities, setQuantities] = useState<TicketQuantities>({});
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Filter visible tickets and sort by sort_order
  const visibleTickets = useMemo(
    () =>
      ticketTypes
        .filter((t) => t.is_visible)
        .sort((a, b) => a.sort_order - b.sort_order),
    [ticketTypes]
  );

  // Calculate total
  const total = useMemo(() => {
    return visibleTickets.reduce((sum, ticket) => {
      const qty = quantities[ticket.id] || 0;
      return sum + ticket.price * qty;
    }, 0);
  }, [visibleTickets, quantities]);

  // Total quantity selected
  const totalQuantity = useMemo(() => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  }, [quantities]);

  const handleQuantityChange = useCallback(
    (ticketId: string, quantity: number) => {
      setQuantities((prev) => ({
        ...prev,
        [ticketId]: quantity,
      }));
    },
    []
  );

  const handleAddToCart = useCallback(async () => {
    setIsAdding(true);

    // Add each selected ticket type to cart
    visibleTickets.forEach((ticket) => {
      const qty = quantities[ticket.id] || 0;
      if (qty > 0) {
        addItem({
          ticketTypeId: ticket.id,
          eventId,
          quantity: qty,
          price: ticket.price,
          name: ticket.name,
          eventTitle,
          eventDate,
        });
      }
    });

    // Reset quantities after adding
    setQuantities({});

    // Small delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAdding(false);
  }, [visibleTickets, quantities, addItem, eventId, eventTitle, eventDate]);

  // Check if all tickets are sold out
  const allSoldOut = visibleTickets.every(
    (t) => t.quantity_total - t.quantity_sold <= 0
  );

  if (visibleTickets.length === 0) {
    return (
      <Card variant="elevated">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-100">
            {tt("noTickets")}
          </h3>
          <p className="text-zinc-500 mt-1">
            {tt("notOnSale")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-full bg-primary-500/15 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{tt("title")}</h3>
            <p className="text-sm text-zinc-500">
              {tt("selectBelow")}
            </p>
          </div>
        </div>

        {/* Ticket List */}
        <div className="space-y-3">
          {visibleTickets.map((ticket) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              quantity={quantities[ticket.id] || 0}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>

        {/* Sold Out Message */}
        {allSoldOut && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-zinc-800 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-zinc-500 flex-shrink-0" />
            <p className="text-sm text-zinc-400">
              {tt("allSoldOut")}
            </p>
          </motion.div>
        )}
      </CardContent>

      {/* Footer with Total and Add to Cart */}
      <CardFooter className="border-t border-zinc-800 bg-zinc-800/50 rounded-b-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {/* Total */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-zinc-500">{tc("total")}</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={total}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-2xl font-bold text-zinc-100"
              >
                {formatPrice(total)}
              </motion.p>
            </AnimatePresence>
            {totalQuantity > 0 && (
              <p className="text-xs text-zinc-500">
                {totalQuantity} {totalQuantity > 1 ? tt("ticketPlural") : tt("ticket")}
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={totalQuantity === 0 || isAdding}
            isLoading={isAdding}
            leftIcon={<ShoppingCart className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            {tt("addToCart")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
