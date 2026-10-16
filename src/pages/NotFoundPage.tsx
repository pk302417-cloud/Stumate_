import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-7xl font-bold text-brand-200 dark:text-brand-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-ink-700 dark:text-ink-200 mb-2">Page not found</h2>
      <p className="text-ink-400 dark:text-ink-500 mb-6 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
