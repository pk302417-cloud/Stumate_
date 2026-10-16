import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header, BottomNav } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-50 dark:bg-ink-950">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <ScrollRestoration />
    </div>
  );
}

export function PlainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ink-50 dark:bg-ink-950">
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <ScrollRestoration />
    </div>
  );
}
