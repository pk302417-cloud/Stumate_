import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Check, Loader2, GraduationCap } from 'lucide-react';
import { searchColleges, requestCollege } from '@/api';
import { cn, formatLocation } from '@/lib/format';
import type { CollegeOption } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
  value: CollegeOption | null;
  onChange: (c: CollegeOption) => void;
}

function useDebounced<T>(v: T, ms = 250): T {
  const [d, setD] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}

export function CollegePicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const q = useDebounced(query.trim());
  const [requesting, setRequesting] = useState(false);

  const { data, isFetching, isError } = useQuery({
    queryKey: ['colleges', q],
    queryFn: () => searchColleges(q, 30),
    staleTime: 60_000,
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search your college or city…"
          autoFocus
          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {isFetching && <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-ink-400" />}
      </div>

      <ul className="max-h-72 overflow-y-auto rounded-xl border border-ink-200 dark:border-ink-800 divide-y divide-ink-100 dark:divide-ink-800" role="listbox">
        {isError && <li className="p-4 text-sm text-error-500">Could not load colleges. Check your connection.</li>}
        {data?.map(c => {
          const selected = value?.id === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onChange(c)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors',
                  selected ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-ink-50 dark:hover:bg-ink-800',
                )}
              >
                <GraduationCap className="w-5 h-5 text-brand-600 flex-shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-ink-900 dark:text-ink-50 truncate">{c.name}</span>
                  {formatLocation(c.city, c.state) && (
                    <span className="flex items-center gap-1 text-xs text-ink-500 dark:text-ink-400">
                      <MapPin className="w-3 h-3" /> {formatLocation(c.city, c.state)}
                    </span>
                  )}
                </span>
                {selected && <Check className="w-5 h-5 text-brand-600" />}
              </button>
            </li>
          );
        })}
        {data && data.length === 0 && !isFetching && (
          <li className="p-4 text-sm text-ink-500">No college found for “{q}”.</li>
        )}
      </ul>

      <button
        type="button"
        onClick={() => setRequesting(true)}
        className="text-sm text-brand-600 dark:text-brand-400 font-medium"
      >
        Can’t find your college? Request it
      </button>

      {requesting && <RequestCollege initialName={query} onClose={() => setRequesting(false)} />}
    </div>
  );
}

function RequestCollege({ initialName, onClose }: { initialName: string; onClose: () => void }) {
  const [name, setName] = useState(initialName);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await requestCollege({ name: name.trim(), city: city.trim(), state: state.trim(), email: email.trim() });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-ink-200 dark:border-ink-800 p-4 space-y-3 bg-ink-50 dark:bg-ink-950">
      {done ? (
        <>
          <p className="text-sm text-ink-700 dark:text-ink-200">
            Thanks! We’ll add your college soon. Share your email below next time and we’ll let you know.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Input label="College name" value={name} onChange={e => setName(e.target.value)} required minLength={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={city} onChange={e => setCity(e.target.value)} />
            <Input label="State" value={state} onChange={e => setState(e.target.value)} />
          </div>
          <Input label="Your email (optional)" type="email" value={email} onChange={e => setEmail(e.target.value)} hint="So we can tell you when it's added" />
          {error && <p className="text-xs text-error-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={busy}>Send request</Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
