import { Link } from 'react-router-dom';
import { ShoppingBag, Tag, ChevronRight, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function StartPage() {
  const { account } = useAuth();
  const first = account?.full_name?.split(' ')[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-ink-50">
        {first ? `Hi ${first} 👋` : 'Welcome 👋'}
      </h1>
      {account?.college_name && (
        <p className="mt-1 text-sm text-ink-500 flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-brand-600" /> {account.college_name}
        </p>
      )}
      <p className="mt-4 text-ink-600 dark:text-ink-300">What would you like to do today?</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ChoiceCard
          to="/home"
          icon={<ShoppingBag className="w-7 h-7" />}
          title="Buy"
          text="Browse everything listed on your campus and search for what you need."
          tone="brand"
        />
        <ChoiceCard
          to="/sell"
          icon={<Tag className="w-7 h-7" />}
          title="Sell"
          text="List something you no longer need — takes about a minute."
          tone="accent"
        />
      </div>
    </div>
  );
}

function ChoiceCard({ to, icon, title, text, tone }: { to: string; icon: React.ReactNode; title: string; text: string; tone: 'brand' | 'accent' }) {
  return (
    <Link
      to={to}
      className="group bg-white dark:bg-ink-900 rounded-2xl shadow-card hover:shadow-card-hover transition-all p-6 flex flex-col gap-3"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tone === 'brand' ? 'bg-brand-500/20 text-brand-200 ring-1 ring-brand-400/40' : 'bg-accent-400/15 text-accent-300 ring-1 ring-accent-400/40'}`}>
        {icon}
      </div>
      <h2 className="font-display text-2xl font-extrabold text-ink-900 dark:text-ink-50">{title}</h2>
      <p className="text-sm text-ink-500 dark:text-ink-400 flex-1">{text}</p>
      <span className="text-sm font-medium text-brand-600 dark:text-brand-400 flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
        Continue <ChevronRight className="w-4 h-4" />
      </span>
    </Link>
  );
}
