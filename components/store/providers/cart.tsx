"use client";

import { createContext, use, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  label: string;
  price: number | null;
  imagePath: string | null;
  accent: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hasPriced: boolean;
  hasUnpriced: boolean;
  showPrices: boolean;
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  update: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "moraes:cart";
const MAX_QUANTITY = 999;
const EMPTY: CartItem[] = [];

const listeners = new Set<() => void>();
let snapshot: CartItem[] | null = null;

function readStorage(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item?.variantId && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

const cartStore = {
  get: () => (snapshot ??= readStorage()),
  set(next: CartItem[]) {
    snapshot = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      snapshot = readStorage();
      listener();
    };
    listeners.add(listener);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};

const noopSubscribe = () => () => {};

function add(item: Omit<CartItem, "quantity">, quantity = 1) {
  const current = cartStore.get();
  const existing = current.find((entry) => entry.variantId === item.variantId);
  cartStore.set(
    existing
      ? current.map((entry) =>
          entry.variantId === item.variantId
            ? { ...entry, ...item, quantity: Math.min(entry.quantity + quantity, MAX_QUANTITY) }
            : entry,
        )
      : [...current, { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }],
  );
}

function update(variantId: string, quantity: number) {
  const current = cartStore.get();
  cartStore.set(
    quantity <= 0
      ? current.filter((entry) => entry.variantId !== variantId)
      : current.map((entry) =>
          entry.variantId === variantId ? { ...entry, quantity: Math.min(quantity, MAX_QUANTITY) } : entry,
        ),
  );
}

const remove = (variantId: string) => cartStore.set(cartStore.get().filter((entry) => entry.variantId !== variantId));
const clear = () => cartStore.set([]);

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ showPrices, children }: { showPrices: boolean; children: ReactNode }) {
  const stored = useSyncExternalStore(cartStore.subscribe, cartStore.get, () => EMPTY);
  const items = useMemo(
    () => (showPrices ? stored : stored.map((item) => ({ ...item, price: null }))),
    [stored, showPrices],
  );
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [open, setOpen] = useState(false);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0),
      hasPriced: items.some((item) => item.price != null),
      hasUnpriced: items.some((item) => item.price == null),
      showPrices,
      ready,
      open,
      setOpen,
      add,
      update,
      remove,
      clear,
    }),
    [items, ready, open, showPrices],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = use(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de CartProvider");
  return context;
}
