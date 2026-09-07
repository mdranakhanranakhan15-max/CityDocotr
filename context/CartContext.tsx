'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

/**
 * Global medicine cart store (CityDoctor Express Pharmacy).
 *
 * Shared by every public page through the root layout so the Navbar cart icon,
 * the home medicine grid "+ Add" buttons and the /shop catalogue all stay in
 * sync. Adding an item automatically slides the CartDrawer in from the right.
 */

export interface CartItem {
  id: string;
  name: string;
  brand?: string;
  composition?: string;
  form?: string;
  category?: string;
  image?: string;
  /** Selling price actually paid (discounted price when on sale). */
  unitPrice: number;
  /** Regular / strike-through price used to compute the savings line. */
  originalPrice: number;
  qty: number;
}

export interface CartContextValue {
  items: CartItem[];
  /** Total number of units in the basket. */
  itemCount: number;
  /** Sum of discounted price × qty. */
  subtotal: number;
  /** Sum of regular price × qty (used for the "You save" amount). */
  originalTotal: number;
  savings: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getQty: (id: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    (item: Omit<CartItem, 'qty'> & { qty?: number }) => {
      setItems((prev) => {
        const existing = prev.find((c) => c.id === item.id);
        if (existing) {
          return prev.map((c) =>
            c.id === item.id ? { ...c, qty: c.qty + (item.qty || 1) } : c
          );
        }
        return [...prev, { ...item, qty: item.qty || 1 }];
      });
      setIsOpen(true); // "+ Add" always opens the slide-over drawer
    },
    []
  );

  const increase = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c))
    );
  }, []);

  const decrease = useCallback((id: string) => {
    setItems((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getQty = useCallback(
    (id: string) => items.find((c) => c.id === id)?.qty || 0,
    [items]
  );

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, c) => sum + c.qty, 0);
    const subtotal = items.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
    const originalTotal = items.reduce(
      (sum, c) => sum + (c.originalPrice > 0 ? c.originalPrice : c.unitPrice) * c.qty,
      0
    );
    return {
      items,
      itemCount,
      subtotal,
      originalTotal,
      savings: Math.max(0, originalTotal - subtotal),
      isOpen,
      openCart,
      closeCart,
      addItem,
      increase,
      decrease,
      removeItem,
      clearCart,
      getQty,
    };
  }, [
    items,
    isOpen,
    openCart,
    closeCart,
    addItem,
    increase,
    decrease,
    removeItem,
    clearCart,
    getQty,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside a <CartProvider>');
  }
  return ctx;
}
