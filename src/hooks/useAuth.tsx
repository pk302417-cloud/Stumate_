import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { config } from '@/config';
import type { MyAccount, Profile } from '@/types/database';
import {
  MOCK_ACCOUNT_KEY,
  MOCK_SESSION_KEY,
  accountToProfile,
  clearLocalFavorites,
  fetchMyAccount,
  readMockAccount,
  syncFavorites,
} from '@/api';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  account: MyAccount | null;
  profile: Profile | null;
  loading: boolean;
  needsOnboarding: boolean;
  needsReconsent: boolean;
  isBanned: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [account, setAccount] = useState<MyAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  const loadAccount = useCallback(async () => {
    try {
      const a = await fetchMyAccount();
      setAccount(a);
    } catch {
      setAccount(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (config.useMocks) {
      try {
        const raw = localStorage.getItem(MOCK_SESSION_KEY);
        if (raw) {
          const { id, email } = JSON.parse(raw);
          setUser({ id, email });
          userIdRef.current = id;
          setAccount(readMockAccount());
        }
      } catch {
        /* ignore */
      }
      return;
    }
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) {
      userIdRef.current = u.id;
      setUser({ id: u.id, email: u.email ?? '' });
      await loadAccount();
    } else {
      userIdRef.current = null;
      setUser(null);
      setAccount(null);
    }
  }, [loadAccount]);

  const signOut = useCallback(async () => {
    if (config.useMocks) {
      try {
        localStorage.removeItem(MOCK_SESSION_KEY);
        localStorage.removeItem(MOCK_ACCOUNT_KEY);
      } catch {
        /* ignore */
      }
    } else {
      await supabase.auth.signOut();
    }
    clearLocalFavorites();
    userIdRef.current = null;
    setUser(null);
    setAccount(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (config.useMocks) {
      try {
        const raw = localStorage.getItem(MOCK_SESSION_KEY);
        if (raw) {
          const { id, email } = JSON.parse(raw);
          userIdRef.current = id;
          setUser({ id, email });
          setAccount(readMockAccount());
        }
      } catch {
        localStorage.removeItem(MOCK_SESSION_KEY);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        userIdRef.current = session.user.id;
        setUser({ id: session.user.id, email: session.user.email ?? '' });
        await loadAccount();
        void syncFavorites().catch(() => undefined);
      }
      if (!cancelled) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Never await supabase calls directly in this callback (deadlock risk) — defer.
      setTimeout(() => {
        if (cancelled) return;
        if (event === 'SIGNED_OUT' || !session?.user) {
          userIdRef.current = null;
          setUser(null);
          setAccount(null);
          setLoading(false);
          return;
        }
        const alreadyKnown = userIdRef.current === session.user.id;
        if (alreadyKnown && (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN')) return;
        userIdRef.current = session.user.id;
        setUser({ id: session.user.id, email: session.user.email ?? '' });
        void loadAccount().then(() => {
          void syncFavorites().catch(() => undefined);
          if (!cancelled) setLoading(false);
        });
      }, 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadAccount]);

  const profile = useMemo(() => (account ? accountToProfile(account) : null), [account]);
  const needsOnboarding = !!user && !!account && !account.onboarded_at;
  const needsReconsent = !!account && !!account.onboarded_at && account.needs_reconsent;
  const isBanned = !!account?.is_banned;

  const value = useMemo(
    () => ({ user, account, profile, loading, needsOnboarding, needsReconsent, isBanned, refresh, signOut }),
    [user, account, profile, loading, needsOnboarding, needsReconsent, isBanned, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
