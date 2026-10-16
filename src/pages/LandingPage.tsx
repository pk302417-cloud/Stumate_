import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MapPin, Wallet, Flag, BadgeCheck } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { BrandMark } from '@/components/ui/BrandMark';
import { useAuth } from '@/hooks/useAuth';

const CATEGORIES = [
  ['furniture', 'Furniture'], ['electronics', 'Electronics'], ['books', 'Books'], ['appliances', 'Appliances'],
  ['bedding', 'Bedding'], ['kitchen', 'Kitchen'], ['home-decor', 'Home Decor'], ['stationery', 'Stationery'],
  ['lab-engineering', 'Lab & Engineering'], ['sports-fitness', 'Sports & Fitness'], ['cycles', 'Cycles'],
] as const;

const STEPS = [
  { title: 'Pick your college and verify your email', desc: 'Search your college, enter your email and type the 6-digit code we send you.' },
  { title: 'List something or find what you need', desc: 'Selling takes a minute: photos, price, age and what it is used for. Buying is search and scroll.' },
  { title: 'Chat, meet on campus, pay in person', desc: 'Agree on a price in chat, meet at your hostel or canteen, pay by cash or UPI after you check the item.' },
];

const SAFETY = [
  { icon: ShieldCheck, text: 'Every member signs up with a code sent to their email' },
  { icon: MapPin, text: 'You only see items from your own campus' },
  { icon: Wallet, text: 'Pay in person, after you see the item. Never send advance money' },
  { icon: Flag, text: 'Report any listing or person in two taps' },
];

const PARTICLES = [
  ['8%', '12%', 3], ['22%', '82%', 2], ['38%', '6%', 2], ['52%', '92%', 3], ['70%', '14%', 2],
  ['84%', '70%', 3], ['16%', '48%', 2], ['92%', '30%', 2], ['64%', '52%', 2],
] as const;

function PriceTag({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 btn-gradient !shadow-none hover:!transform-none pl-2.5 pr-3.5 py-1 rounded-r-full rounded-l-lg font-display font-bold ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-ink-950/70" aria-hidden />
      {children}
    </span>
  );
}

function FloatCard({ slug, title, meta, price, className = '', rotate = '0deg', slow = false, big = false }: {
  slug: string; title: string; meta: string; price: string; className?: string; rotate?: string; slow?: boolean; big?: boolean;
}) {
  return (
    <div
      className={`absolute rounded-3xl bg-ink-900/95 ring-1 ring-white/10 backdrop-blur-sm shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ${slow ? 'animate-float-slow' : 'animate-float'} ${className}`}
      style={{ ['--r' as string]: rotate }}
    >
      <div className={big ? 'p-4' : 'p-3'}>
        <div className={`${big ? 'h-44 sm:h-52' : 'h-24'} rounded-2xl flex items-center justify-center bg-gradient-to-br from-brand-500/30 via-ink-800 to-accent-400/20 ring-1 ring-white/5`}>
          <CategoryIcon slug={slug} className={`${big ? 'w-20 h-20' : 'w-10 h-10'} text-ink-50 drop-shadow-[0_0_18px_rgba(139,92,246,0.9)]`} />
        </div>
        <p className={`mt-3 font-semibold text-ink-50 ${big ? 'text-base' : 'text-sm'} leading-snug`}>{title}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-ink-400">{meta}</span>
          <PriceTag className={big ? 'text-base' : 'text-sm'}>{price}</PriceTag>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { user } = useAuth();
  const primaryTo = user ? '/start' : '/signup';

  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      {/* Hero */}
      <section className="relative overflow-hidden isolate">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -left-40 top-1/3 w-[640px] h-[640px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.28),transparent_65%)]" />
          <div className="absolute right-[-120px] top-[-80px] w-[620px] h-[620px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_65%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-16 md:pb-24">
          <nav className="flex items-center justify-between mb-12 md:mb-16">
            <Link to="/" className="flex items-center gap-2.5">
              <BrandMark className="w-9 h-9" />
              <span className="font-display font-extrabold text-xl tracking-tight">Stumate</span>
            </Link>
            <div className="flex items-center gap-2">
              {user ? (
                <Link to="/start" className="px-4 py-2 rounded-xl ring-1 ring-white/15 hover:bg-white/5 text-sm font-semibold transition-colors">Open app</Link>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 text-sm font-semibold text-ink-300 hover:text-white transition-colors">Sign in</Link>
                  <Link to="/signup" className="px-4 py-2 rounded-xl btn-gradient text-sm">Sign up</Link>
                </>
              )}
            </div>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
            <div>
              <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 ring-1 ring-brand-400/30 text-sm text-brand-200 shadow-[0_0_24px_-6px_rgba(139,92,246,0.6)]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400" aria-hidden />
                Hostel sale season 2026
              </div>
              <h1
                className="animate-fade-up mt-6 font-display text-[2.6rem] sm:text-6xl lg:text-[4.1rem] font-extrabold leading-[1.04] tracking-tight"
                style={{ animationDelay: '90ms' }}
              >
                Seniors are leaving.<br />
                <span className="text-gradient">Their things don’t have to.</span>
              </h1>
              <p
                className="animate-fade-up mt-6 text-lg text-ink-300 max-w-xl leading-relaxed"
                style={{ animationDelay: '180ms' }}
              >
                Buy and sell hostel essentials on your own campus: tables, books, coolers, cycles.
                Fair prices, verified students, pickup in minutes.
              </p>
              <div className="animate-fade-up mt-9 flex flex-col sm:flex-row gap-3" style={{ animationDelay: '270ms' }}>
                <Link
                  to={primaryTo}
                  className="btn-gradient inline-flex items-center justify-center gap-2 h-13 min-h-[3.25rem] px-7 rounded-2xl text-base"
                >
                  {user ? 'Open Stumate' : 'Create your account'} <ArrowRight className="w-5 h-5" />
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center min-h-[3.25rem] px-7 rounded-2xl text-base font-medium text-ink-100 ring-1 ring-white/15 hover:ring-white/30 hover:bg-white/5 transition-all duration-200"
                  >
                    I already have an account
                  </Link>
                )}
              </div>
              <ul className="animate-fade-up mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-400" style={{ animationDelay: '360ms' }}>
                <li className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-accent-400" /> Email-verified students</li>
                <li className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-accent-400" /> Your campus only</li>
                <li className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-accent-400" /> Free to list</li>
              </ul>
            </div>

            {/* Floating listings */}
            <div className="relative h-[520px] sm:h-[520px] lg:h-[560px]" aria-hidden>
              <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.35),rgba(34,211,238,0.12)_45%,transparent_70%)] blur-2xl" />
              {PARTICLES.map(([top, left, size], i) => (
                <span
                  key={i}
                  className="absolute rounded-full bg-accent-300/70"
                  style={{ top, left, width: size, height: size, boxShadow: '0 0 10px rgba(34,211,238,0.9)' }}
                />
              ))}
              <FloatCard
                big slug="furniture" title="Study table with drawer" meta="1 yr old · C-Block" price="₹800"
                className="left-[4%] top-[2%] w-[66%] sm:left-[14%] sm:top-[14%] sm:w-[62%] max-w-[340px]" rotate="-3deg"
              />
              <FloatCard
                slug="books" title="Engineering Maths set" meta="6 mo old" price="₹450"
                className="right-0 top-[64%] w-[44%] sm:top-0 sm:w-[44%] max-w-[210px]" rotate="4deg" slow
              />
              <FloatCard
                slug="cycles" title="Hero cycle, geared" meta="2 yrs old" price="₹2,500"
                className="left-0 bottom-[2%] w-[46%] max-w-[220px]" rotate="-5deg" slow
              />
              <div className="hidden sm:block absolute right-[2%] bottom-[6%] animate-float rounded-2xl bg-ink-900/95 ring-1 ring-white/10 px-4 py-3 shadow-glow" style={{ ['--r' as string]: '3deg' }}>
                <p className="text-xs text-ink-400">Leaving this week</p>
                <p className="font-display font-bold text-lg text-gradient">12 seniors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold max-w-xl tracking-tight">
          From sign-up to handover in three steps
        </h2>
        <ol className="mt-10 grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-3xl bg-ink-900 ring-1 ring-white/10 p-6 hover:ring-brand-400/50 transition-shadow duration-300">
              <span className="block font-display font-extrabold text-5xl leading-none text-gradient mb-5" aria-hidden>{i + 1}</span>
              <h3 className="font-display font-bold text-xl mb-2">{s.title}</h3>
              <p className="text-ink-400 text-sm leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Categories */}
      <section className="border-y border-white/10 bg-ink-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="font-display text-3xl font-extrabold tracking-tight mb-8">Whatever your room is missing</h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map(([slug, label]) => (
              <Link
                key={slug}
                to={primaryTo}
                className="inline-flex items-center gap-2 pl-3 pr-5 py-2.5 rounded-full bg-ink-900 ring-1 ring-white/10 text-ink-100 font-medium hover:ring-accent-400/60 hover:shadow-[0_0_24px_-8px_rgba(34,211,238,0.7)] transition-all duration-200"
              >
                <CategoryIcon slug={slug} className="w-5 h-5 text-accent-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Built for meeting people you share a campus with
          </h2>
          <p className="mt-4 text-ink-400 leading-relaxed max-w-md">
            Everyone here is a student at your college. Meet in public campus spots, check the item before you pay,
            and report anything that feels off.
          </p>
        </div>
        <ul className="space-y-3">
          {SAFETY.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-4 rounded-2xl bg-ink-900 ring-1 ring-white/10 p-4">
              <span className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-ink-100 font-medium">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[2rem] bg-ink-900 ring-1 ring-white/10 px-6 sm:px-12 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.35),transparent_65%)]" aria-hidden />
          <h2 className="relative font-display text-3xl md:text-4xl font-extrabold max-w-md leading-tight tracking-tight">
            Got something to sell before the semester ends?
          </h2>
          <Link to={primaryTo} className="relative btn-gradient inline-flex items-center justify-center gap-2 min-h-[3.25rem] px-7 rounded-2xl">
            {user ? 'Open Stumate' : 'Create your account'} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
