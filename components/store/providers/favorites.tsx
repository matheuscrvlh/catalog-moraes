"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";
import { useSession } from "./session";

type FavoritesContextValue = {
  ids: Set<string>;
  toggle: (productId: string) => Promise<void>;
};

const EMPTY = new Set<string>();

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loaded, setLoaded] = useState<{ userId: string; ids: Set<string> } | null>(null);
  const ids = useMemo(() => (user && loaded?.userId === user.id ? loaded.ids : EMPTY), [user, loaded]);
  const setIds = useCallback(
    (update: (current: Set<string>) => Set<string>) =>
      user &&
      setLoaded((current) => ({ userId: user.id, ids: update(current?.userId === user.id ? current.ids : EMPTY) })),
    [user],
  );

  useEffect(() => {
    if (!user) return;
    getBrowserClient()
      .from("favorites")
      .select("product_id")
      .then(({ data }) => setLoaded({ userId: user.id, ids: new Set((data ?? []).map((row) => row.product_id)) }));
  }, [user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        router.push(`/entrar?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const supabase = getBrowserClient();
      const isFavorite = ids.has(productId);
      setIds((current) => {
        const next = new Set(current);
        if (isFavorite) next.delete(productId);
        else next.add(productId);
        return next;
      });
      const { error } = isFavorite
        ? await supabase.from("favorites").delete().eq("product_id", productId).eq("user_id", user.id)
        : await supabase.from("favorites").insert({ product_id: productId, user_id: user.id });
      if (error) {
        setIds((current) => {
          const next = new Set(current);
          if (isFavorite) next.add(productId);
          else next.delete(productId);
          return next;
        });
      }
    },
    [ids, setIds, user, router, pathname],
  );

  const value = useMemo(() => ({ ids, toggle }), [ids, toggle]);
  return <FavoritesContext value={value}>{children}</FavoritesContext>;
}

export function useFavorites() {
  const context = use(FavoritesContext);
  if (!context) throw new Error("useFavorites precisa estar dentro de FavoritesProvider");
  return context;
}
