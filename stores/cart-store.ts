import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/database";

// =============================================================================
// TYPES
// =============================================================================

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (ticketTypeId: string) => void;
  updateQuantity: (ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
}

type CartStore = CartState & CartActions;

// =============================================================================
// HELPERS
// =============================================================================

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// =============================================================================
// STORE
// =============================================================================

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      total: 0,

      // Actions
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(
          (i) => i.ticketTypeId === item.ticketTypeId
        );

        if (existingItem) {
          // Update quantity if item already exists
          const updatedItems = items.map((i) =>
            i.ticketTypeId === item.ticketTypeId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
          });
        } else {
          // Add new item
          const updatedItems = [...items, item];
          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
          });
        }
      },

      removeItem: (ticketTypeId) => {
        const { items } = get();
        const updatedItems = items.filter(
          (item) => item.ticketTypeId !== ticketTypeId
        );
        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
        });
      },

      updateQuantity: (ticketTypeId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          const updatedItems = items.filter(
            (item) => item.ticketTypeId !== ticketTypeId
          );
          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
          });
        } else {
          // Update quantity
          const updatedItems = items.map((item) =>
            item.ticketTypeId === ticketTypeId ? { ...item, quantity } : item
          );
          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
          });
        }
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
        });
      },
    }),
    {
      name: "event-cart-storage", // Key in localStorage
      partialize: (state) => ({
        items: state.items,
        total: state.total,
      }),
    }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectCartItemCount = (state: CartStore): number =>
  state.items.reduce((count, item) => count + item.quantity, 0);

export const selectCartItemByTicketType = (
  state: CartStore,
  ticketTypeId: string
): CartItem | undefined =>
  state.items.find((item) => item.ticketTypeId === ticketTypeId);
