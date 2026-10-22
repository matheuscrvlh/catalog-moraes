"use client";

import { useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

export function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    const key = `moraes:viewed:${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    getBrowserClient().rpc("track_product_view", { product: productId });
  }, [productId]);

  return null;
}
