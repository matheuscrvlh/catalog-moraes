"use client";

import type { ReactNode } from "react";
import { CartProvider } from "./cart";
import { FavoritesProvider } from "./favorites";
import { SessionProvider } from "./session";

export function StoreProviders({ showPrices, children }: { showPrices: boolean; children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider showPrices={showPrices}>
        <FavoritesProvider>{children}</FavoritesProvider>
      </CartProvider>
    </SessionProvider>
  );
}
