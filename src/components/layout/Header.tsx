import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, MessageCircle, User, Plus, Home, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/components/ui/BrandMark';

export function Header() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-ink-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-3 h-14">
          <Link to={user ? '/start' : '/'} className="flex items-center gap-2 flex-shrink-0">
            <BrandMark />
            <span className="font-display font-extrabold text-xl tracking-tight text-white hidden sm:block">
              Stumate
            </span>
          </Link>

          <button
            onClick={() => navigate('/search')}
            className="flex-1 flex items-center gap-2 h-10 px-3 rounded-xl bg-ink-900 ring-1 ring-white/10 text-ink-400 text-sm hover:ring-brand-400/50 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:block">Search for mattresses, books, electronics...</span>
            <span className="sm:hidden">Search items...</span>
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  to="/sell"
                  className="btn-gradient mr-1 px-3.5 py-2 text-sm rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Sell
                </Link>
                <IconButton to="/favorites" label="Favorites">
                  <Heart className="w-5 h-5" />
                </IconButton>
                <IconButton to="/chats" label="Chats">
                  <MessageCircle className="w-5 h-5" />
                </IconButton>
                <IconButton to="/profile" label="Profile">
                  <User className="w-5 h-5" />
                </IconButton>
                {profile?.role === 'admin' && (
                  <IconButton to="/admin" label="Admin">
                    <ShieldAlert className="w-5 h-5" />
                  </IconButton>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 rounded-xl">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-gradient px-4 py-2 text-sm rounded-xl">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function IconButton({ to, label, children }: { to: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800 transition-colors"
    >
      {children}
    </Link>
  );
}

export function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;
  const items = [
    { to: '/home', label: 'Buy', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/sell', label: 'Sell', icon: Plus, primary: true },
    { to: '/chats', label: 'Chats', icon: MessageCircle },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink-950/90 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors',
                item.primary
                  ? 'text-brand-300'
                  : 'text-ink-500 dark:text-ink-400'
              )}
            >
              <div className={cn(
                'flex items-center justify-center transition-all',
                item.primary && 'w-11 h-11 rounded-full btn-gradient -mt-5 shadow-glow'
              )}>
                <Icon className={cn(item.primary ? 'w-5 h-5' : 'w-5 h-5')} />
              </div>
              <span className={cn(item.primary && 'font-medium')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
