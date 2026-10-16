import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/ui/BrandMark';

const SAMPLE = [
  { name: 'Study table with drawer', meta: '1 yr old · C-Block', price: '₹800' },
  { name: 'Engineering Maths set', meta: '6 months old · Hostel 4', price: '₹450' },
  { name: 'Table fan, 3 speed', meta: '8 months old · D-Block', price: '₹600' },
];

export function AuthShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-ink-950 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 border-r border-white/10">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-24 bottom-0 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.35),transparent_65%)]" />
          <div className="absolute right-[-120px] top-[-60px] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_65%)]" />
        </div>
        <Link to="/" className="relative flex items-center gap-2.5">
          <BrandMark className="w-10 h-10" />
          <span className="font-display font-extrabold text-2xl tracking-tight text-white">Stumate</span>
        </Link>
        <div className="relative space-y-3 max-w-sm">
          {SAMPLE.map((s, i) => (
            <div
              key={s.name}
              className="bg-ink-900/90 ring-1 ring-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)] animate-float-slow"
              style={{ animationDelay: `${i * 1.2}s` }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-50 truncate">{s.name}</p>
                <p className="text-sm text-ink-400">{s.meta}</p>
              </div>
              <span className="btn-gradient font-display font-bold pl-3 pr-4 py-1 rounded-r-full rounded-l-lg">{s.price}</span>
            </div>
          ))}
        </div>
        <p className="relative font-display text-3xl font-extrabold leading-tight max-w-sm text-white tracking-tight">
          Your seniors are leaving. <span className="text-gradient">Their things are staying on campus.</span>
        </p>
      </aside>

      <div className="relative flex items-center justify-center px-4 py-10">
        <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden>
          <div className="absolute left-1/2 -translate-x-1/2 -top-24 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.25),transparent_65%)]" />
        </div>
        <div className={`relative ${wide ? 'w-full max-w-lg' : 'w-full max-w-md'}`}>
          <Link to="/" className="flex items-center gap-2 justify-center mb-6 lg:hidden">
            <BrandMark className="w-10 h-10" />
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">Stumate</span>
          </Link>
          <div className="bg-ink-900 ring-1 ring-white/10 rounded-3xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
