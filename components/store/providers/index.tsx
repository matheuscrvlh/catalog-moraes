"use client";

import type { ReactNode } from "react";
import { CartProvider } from "./cart";
import { FavoritesProvider } from "./favorites";
import { SessionProvider } from "./session";

export function StoreProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </CartProvider>
    </SessionProvider>
  );
}
