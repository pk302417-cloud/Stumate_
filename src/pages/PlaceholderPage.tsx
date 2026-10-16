export function PlaceholderPage({ title, message }: { title: string; message?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-ink-800 dark:text-ink-100 mb-2">{title}</h1>
      <p className="text-ink-400 dark:text-ink-500 max-w-md">{message ?? 'This page is coming soon.'}</p>
    </div>
  );
}
