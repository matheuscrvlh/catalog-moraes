"use client";

import { usePathname } from "next/navigation";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/browser";

type SessionUser = { id: string; email: string; name: string };
type SessionState = { user: SessionUser | null; ready: boolean };

const SessionContext = createContext<SessionState>({ user: null, ready: false });

const toUser = (user: User | null | undefined): SessionUser | null =>
  user
    ? { id: user.id, email: user.email ?? "", name: String(user.user_metadata?.full_name ?? user.email ?? "") }
    : null;

export function SessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<SessionState>({ user: null, ready: false });

  useEffect(() => {
    const { data } = getBrowserClient().auth.onAuthStateChange((_event, session) =>
      setState({ user: toUser(session?.user), ready: true }),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    getBrowserClient()
      .auth.getSession()
      .then(({ data }) =>
        setState((current) =>
          current.ready && current.user?.id === data.session?.user.id
            ? current
            : { user: toUser(data.session?.user), ready: true },
        ),
      );
  }, [pathname]);

  return <SessionContext value={state}>{children}</SessionContext>;
}

export const useSession = () => use(SessionContext);
