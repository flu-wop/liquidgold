"use client";

// Client-side cart state, persisted to localStorage. This is a REAL cart
// (add/remove/qty works), but checkout at the end is a MOCK flow — no
// Stripe/Square call happens. Matches the same demo pattern used on the
// Lamara Coffee proposal build: functional cart, fake success screen.

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { Product } from "@/lib/products";

export type CartItem = {
  handle: string;
  name: string;
  scent: string;
  type: Product["type"];
  size: string;
  price: number;
  image: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (handle: string) => void;
  updateQty: (handle: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "liquid-gold-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after initial load)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or unavailable — cart still works in-memory
    }
  }, [items, hydrated]);

  function addItem(product: Product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.handle === product.handle);
      if (existing) {
        return prev.map((i) =>
          i.handle === product.handle ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          handle: product.handle,
          name: product.name.split(" — ")[0],
          scent: product.scent,
          type: product.type,
          size: product.size,
          price: product.price,
          image: product.image,
          qty,
        },
      ];
    });
  }

  function removeItem(handle: string) {
    setItems((prev) => prev.filter((i) => i.handle !== handle));
  }

  function updateQty(handle: string, qty: number) {
    if (qty < 1) return removeItem(handle);
    setItems((prev) => prev.map((i) => (i.handle === handle ? { ...i, qty } : i)));
  }

  function clear() {
    setItems([]);
  }

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clear, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
