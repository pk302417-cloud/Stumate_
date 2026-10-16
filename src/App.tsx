import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout, PlainLayout } from '@/routes/layouts';
import { RequireAuth, RequireOnboarded, RequireAdmin, BannedScreen } from '@/routes/guards';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
  </div>
);

const VerifyPage = lazy(() => import('@/pages/VerifyPage').then(m => ({ default: m.VerifyPage })));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const MarketplaceHome = lazy(() => import('@/pages/MarketplaceHome').then(m => ({ default: m.MarketplaceHome })));
const SearchPage = lazy(() => import('@/pages/SearchPage').then(m => ({ default: m.SearchPage })));
const ListingDetailPage = lazy(() => import('@/pages/ListingDetailPage').then(m => ({ default: m.ListingDetailPage })));
const StartPage = lazy(() => import('@/pages/StartPage').then(m => ({ default: m.StartPage })));
const SellPage = lazy(() => import('@/pages/SellPage').then(m => ({ default: m.SellPage })));
const MyListingsPage = lazy(() => import('@/pages/MyListingsPage').then(m => ({ default: m.MyListingsPage })));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const ChatsPage = lazy(() => import('@/pages/ChatsPage').then(m => ({ default: m.ChatsPage })));
const ChatThreadPage = lazy(() => import('@/pages/ChatThreadPage').then(m => ({ default: m.ChatThreadPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })));

const withSuspense = (el: React.ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    element: <PlainLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/verify', element: withSuspense(<VerifyPage />) },
      { path: '/terms', element: <PlaceholderPage title="Terms of Service" message="This page will contain the full Terms of Service draft." /> },
      { path: '/privacy', element: <PlaceholderPage title="Privacy Policy" message="This page will contain the full Privacy Policy draft." /> },
      { path: '/community-guidelines', element: <PlaceholderPage title="Community Guidelines" message="This page will contain community guidelines and prohibited items list." /> },
      { path: '/safety-tips', element: <PlaceholderPage title="Safety Tips" message="This page will contain safety tips for campus meetups." /> },
      { path: '/grievance', element: <PlaceholderPage title="Grievance Redressal" message="This page will contain the grievance filing form and officer details." /> },
      { path: '/cookies', element: <PlaceholderPage title="Cookie & Local Storage Notice" message="This page will contain the cookie and local storage notice." /> },
      { path: '/about', element: <PlaceholderPage title="About Stumate" message="Learn about Stumate — the campus marketplace by students, for students." /> },
      { path: '/contact', element: <PlaceholderPage title="Contact Us" message="Get in touch with the Stumate team." /> },
      { path: '/faq', element: <PlaceholderPage title="FAQ" message="Frequently asked questions about Stumate." /> },
    ],
  },
  {
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { path: '/onboarding', element: withSuspense(<OnboardingPage />) },
      { path: '/banned', element: <BannedScreen /> },
    ],
  },
  {
    element: <RequireOnboarded><AppLayout /></RequireOnboarded>,
    children: [
      { path: '/start', element: withSuspense(<StartPage />) },
      { path: '/home', element: withSuspense(<MarketplaceHome />) },
      { path: '/search', element: withSuspense(<SearchPage />) },
      { path: '/listing/:id', element: withSuspense(<ListingDetailPage />) },
      { path: '/sell', element: withSuspense(<SellPage />) },
      { path: '/sell/:id/edit', element: withSuspense(<SellPage />) },
      { path: '/my-listings', element: withSuspense(<MyListingsPage />) },
      { path: '/favorites', element: withSuspense(<FavoritesPage />) },
      { path: '/chats', element: withSuspense(<ChatsPage />) },
      { path: '/chats/:id', element: withSuspense(<ChatThreadPage />) },
      { path: '/profile', element: withSuspense(<ProfilePage />) },
    ],
  },
  {
    element: <RequireAdmin><AppLayout /></RequireAdmin>,
    children: [
      { path: '/admin', element: withSuspense(<AdminPage />) },
      { path: '/admin/reports', element: withSuspense(<AdminPage />) },
      { path: '/admin/users', element: withSuspense(<AdminPage />) },
      { path: '/admin/data-requests', element: withSuspense(<AdminPage />) },
    ],
  },
  { path: '/404', element: withSuspense(<NotFoundPage />) },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
