import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';
import { ShieldOff, Loader2 } from 'lucide-react';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function RequireOnboarded({ children }: { children: ReactNode }) {
  const { user, account, loading, refresh, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!account) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-ink-600 dark:text-ink-300">We couldn't load your account. Check your connection and try again.</p>
        <div className="flex gap-3">
          <button onClick={() => void refresh()} className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium">Retry</button>
          <button onClick={() => void signOut()} className="px-5 py-2.5 border border-ink-300 rounded-xl">Sign out</button>
        </div>
      </div>
    );
  }
  if (account.is_banned) return <Navigate to="/banned" replace />;
  if (!account.onboarded_at) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/404" replace />;

  return <>{children}</>;
}

export function BannedScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-ink-50 dark:bg-ink-950">
      <div className="w-20 h-20 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center mb-6">
        <ShieldOff className="w-10 h-10 text-error-500" />
      </div>
      <h1 className="text-2xl font-bold text-ink-800 dark:text-ink-100 mb-2">Account suspended</h1>
      <p className="text-ink-500 dark:text-ink-400 max-w-md mb-6">
        Your account has been suspended for violating our community guidelines.
        If you believe this is a mistake, you can file a grievance.
      </p>
      <a
        href="/grievance"
        className="px-6 py-3 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors"
      >
        File a grievance
      </a>
    </div>
  );
}
